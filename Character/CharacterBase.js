const MapManager = require("../Map/MapManager.js")
const Utils = require('../Utils.js') 
const CharactersData = require("./CharactersData.js")

//availableDirections can not be null
function moveOneStep(lastDirection, availableDirections, directionProbability, position, inventory, time, charName){

	var direction
	if (lastDirection == "") {
		direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
	} else {
		var idx = availableDirections.indexOf(lastDirection)

		if (idx < 0) {
			direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
		} else {
			var newWeights = []
			for (let i = 0; i < Utils.DIRECTION.length; i++) {
                if (availableDirections.includes(Utils.DIRECTION[i])) {
                    if (Utils.DIRECTION[i] == lastDirection) {
                        newWeights.push(100)
                    } else {
                        newWeights.push(10)
                    }
                } else {
                    newWeights.push(0)
                }
			}
			directionProbability.updateWeights(newWeights)
			direction = directionProbability.randomlyPick()
		}
	}

	lastDirection = direction

	var step = 1
	// check is on a road
	// speed will be higher when on a road
	if (MapManager.checkIsOnARoad(position)) {
		step = step + 1
	}
	switch(direction){
		case Utils.DIRECTION[0]:
			position[1] = position[1] - step < 0 ? 0 : position[1] - step
			break
		case Utils.DIRECTION[1]:
			position[1] = position[1] + step >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : position[1] + step
			break
		case Utils.DIRECTION[2]:
			position[0] = position[0] - step < 0 ? 0 : position[0] - step
			break;
		case Utils.DIRECTION[3]:
			position[0] = position[0] + step >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : position[0] + step
			break
	}

    var gear = MapManager.checkHasGearOnPos(position)
    if (inventory != null && gear != false) {
        pickUpGear(gear, inventory)
		const Logger = require('../Logger.js').Logger
        Logger.info({
			"N1": charName,
			"L": "picks up",
			"N2": gear.name,
			"T": time,
		})
    }
    return [lastDirection, position]
}

function pickUpGear(gear, inventory){
    inventory.push(gear)
    gear.updateMapPosition([0, 0])
    MapManager.removeGearFromGearMap(gear)
}

// function setState(state, character, target){
//     character.state.updateState(state, target)
// }
function dropInventory(inventory, pos){
    if (inventory.length <= 0) {return}

    var randomPositions = MapManager.getRandomPosAroundPos(pos)
    for (let i = 0; i < inventory.length; i++) {
        var randomPos = randomPositions[Math.floor(Math.random() * randomPositions.length)]
        MapManager.addGearOnMap(inventory[i], randomPos)
        // console.log("hahahahahha      " + inventory[i].name + " " + randomPos)
    }
    inventory = []
}


function attack(character, time){
	const Logger = require('../Logger.js').Logger
    // check if the character died
	if (character.state.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		
		character.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		character.wander(time)
		return [false]
	}		

	// check attack range
	var target = character.state.target
	// var distance = Math.abs(character.position[0] - target.position[0]) + Math.abs(character.position[1] - target.position[1])
	var distance = calDistanceOfCharacters(character, target)
	if (distance > character.attackRange) {
		// this frame still need to move
		if (distance > character.visualRange) {
			Logger.info({
				N1: character.charName,
				L: "target ran away, start to patrol",
				N2: target.charName,
				T: time,
			})
			character.state.setState(Utils.CHARACTER_STATES.PATROL, null)
			character.wander(time)
		} else {
			Logger.info({
				N1: character.charName,
				L: "target is out of attack range, start to chase",
				N2: target.charName,
				T: time,
			})
			character.state.setState(Utils.CHARACTER_STATES.CHASE, target)
			character.chase(time)
		}
		return [false]
	}

    if (character.inventory.length > 0) {
        for (let i = 0; i < character.inventory.length; i++){
            var weapon = character.inventory[i]
            if (weapon.gearType == Utils.GEAR_TYPES[1]) {
                // const Logger = require('../Logger.js').Logger
                Logger.info({
                    N1: character.charName,
                    L: "shoots",
                    N2: target.charName,
                    T: time,
                })
                var isAvailable = weapon.use(time)
                if (!isAvailable) {
                    character.inventory.splice(i, 1)
                    Logger.info({
                        "N1": weapon.name,
                        "L": "is broken",
                        "N2": "",
                        "T": time,
                    })
                }
                return [true, weapon]
            }
        }
		// const Logger = require('../Logger.js').Logger
		Logger.info({
            N1: character.charName,
            L: "attacks",
            N2: target.charName,
            T: time,
        })
        return [true]
    } else {
        Logger.info({
            N1: character.charName,
            L: "attacks",
            N2: target.charName,
            T: time,
        })
        return [true]
    }
	
}

function updateHealthState(hp, baseHp){
	var percentage = hp / baseHp
	healthState = Utils.HEALTH_STATES.NORMAL
	if (percentage > Utils.HEALTH_STATES.SCRATCHED) {
		healthState = Utils.HEALTH_STATES.NORMAL
	} else if (percentage <= Utils.HEALTH_STATES.SCRATCHED && percentage > Utils.HEALTH_STATES.HURT) {
		healthState = Utils.HEALTH_STATES.SCRATCHED
	} else if (percentage <= Utils.HEALTH_STATES.HURT && percentage > Utils.HEALTH_STATES.INCAPACITATED) {
		healthState = Utils.HEALTH_STATES.HURT
	} else if (percentage <= Utils.HEALTH_STATES.INCAPACITATED && percentage > Utils.HEALTH_STATES.DIED) {
		healthState = Utils.HEALTH_STATES.INCAPACITATED
	} else {
		healthState = Utils.HEALTH_STATES.DIED
	}

	return healthState
}

function heal(healIdx, charName, targetName, medikit, inventory, time){
	const Logger = require('../Logger.js').Logger
	healIdx ++
	var result = medikit.use(time)
	if (!result) {
		removeGearFromInventory(medikit, inventory)
		// if medikit is used up, healing finished, return
		healIdx = Utils.HEAL_STEP
		Logger.info({
            N1: charName,
            L: "finished healing",
            N2: targetName,
            T: time,
        })
		return true
	}

	if (healIdx >= Utils.HEAL_STEP) {
		Logger.info({
            N1: charName,
            L: "finished healing",
            N2: targetName,
            T: time,
        })
		return true
	} else {
		Logger.info({
            N1: charName,
            L: "is healing",
            N2: targetName,
            T: time,
        })
		return false
	}
}

function removeGearFromInventory(gear, inventory){
	if (inventory.length <= 0) {return inventory}

	var idx = inventory.indexOf(gear)

    if (idx > -1) { 
        inventory.splice(idx, 1)
    }
	return inventory
}

function hasMediKit(inventory){
	if (inventory.length <= 0) {return [false]}

	for (let i = 0; i < inventory.length; i++) {
		var gear = inventory[i]
		if (gear.gearType == Utils.GEAR_TYPES[0]) {
			return [true, gear]
		}
	}
	return [false]
}

function calDistanceOfCharacters(char1, char2) {
	return Math.abs(char1.position[0] - char2.position[0]) + Math.abs(char1.position[1] - char2.position[1])
}

function checkIsDied(character) {
	return character.state.stateType == Utils.CHARACTER_STATES.DIED
}

function getAvailableDirectionsForPatrol(position, characterType){
	var availableDirections = []
	for (let i = 0; i < Utils.DIRECTION.length; i++) {
		var tempDir = Utils.DIRECTION[i]
		var tempPos = JSON.parse(JSON.stringify(position))
		switch (tempDir) {
			case Utils.DIRECTION[0]:
				tempPos[1]--
				break
			case Utils.DIRECTION[1]:
				tempPos[1]++
				break
			case Utils.DIRECTION[2]:
				tempPos[0]--
				break
			case Utils.DIRECTION[3]:
				tempPos[0]++
				break
		}
		if (tempPos[0] >=0 && tempPos[0] < Utils.MAP_SIZE[0] 
			&& tempPos[1] >=0 && tempPos[1] < Utils.MAP_SIZE[1]) {
			
			var isInBuilding = MapManager.getMap().checkIsInABuilding(tempPos)
			// console.log("hahahaha    " + characterType + " " + isInBuilding[0])
			if (!(isInBuilding[0] && characterType == Utils.CHARACTER_TYPE.ALIEN)){
				availableDirections.push(tempDir)
			}
		}
	}
	return availableDirections
}

function getAwayTargetDirection(characterType, position, target){
	var oppositDir = []
	if (position[0] - target.position[0] > 0) {
		oppositDir.push(Utils.DIRECTION[3])
	} else if (position[0] - target.position[0] < 0) {
		oppositDir.push(Utils.DIRECTION[2])
	} else {
		oppositDir.push(Utils.DIRECTION[2])
		oppositDir.push(Utils.DIRECTION[3])
	}

	if (position[1] - target.position[1] > 0) {
		oppositDir.push(Utils.DIRECTION[1])
	} else if (position[1] - target.position[0] < 1) {
		oppositDir.push(Utils.DIRECTION[0])
	} else {
		oppositDir.push(Utils.DIRECTION[0])
		oppositDir.push(Utils.DIRECTION[1])
	}

	return oppositDir
}

function getApproachTargetDirection(characterType, position, target){

}

function checkPositionAccessible(characterType){
	var isInBuilding = MapManager.checkIsInABuilding(pos)
	if (isInBuilding[0]) {
		if (characterType == Utils.CHARACTER_TYPE.ALIEN) { return false}
		var buildingId = isInBuilding[1]
		var building = MapManager.getBuilding(buildingId)
		if (building.checkIsDestroyed()) {return false}
	}
	return true
}

//--------- Intervene----------

// add a new order
// if this agent has already got an order, then don't give the order
// first come first serve

function addOrder(character, target, order){
	const ORDER_TYPE = require("../DramaManager/Order.js").ORDER_TYPE
	if (target == null) {
		switch(order.orderType){
			case ORDER_TYPE.ATTACK:
			case ORDER_TYPE.CHASE:
			case ORDER_TYPE.KILL:
				target = findEnemy(character)
				order.updateTarget(target)
				break
			case ORDER_TYPE.MOVE:
				// TO DO: find????
				break
			case ORDER_TYPE.HEAL:
				//TO DO: find ally
				break
		}
	}
	if (target == null) {
		// abandon this turn
		return
	}

	if (character.order == null) {
		character.order = order
		console.log("add order " + order.orderType + " " + character.charName + " to " + order.target.charName)
	}
} 

function checkOrder(character){
	if (character.order != null && character.order.isExecuted()){
		removeOrder(character)
	}
}

function removeOrder(character){
	character.order = null
	console.log("ORDER REMOVED: " + character.charName + character.order == null)
}

/// Find an enemy nearby
function findEnemy(agent){
	if (agent == null) {
		return null
	}
    /// enemies nearby (check the map)
    /// if target is an alien, find solders and armed civilians
    /// if target is a human, find aliens

    var range = 15
	var startX = agent.position[0] - range < 0 ? 0 : agent.position[0] - range
	var endX = agent.position[0] + range >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : agent.position[0] + range
	var startY = agent.position[1] - range < 0 ? 0 : agent.position[1] - range
	var endY = agent.position[1] + range >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : agent.position[1] + range

    var enemies = []
    for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		var characterPos = character.position
		if (character.state.stateType != Utils.CHARACTER_STATES.DIED 
			&& characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.charType != agent.charType){
			// && ((agent.charType == Utils.CHARACTER_TYPE.ALIEN && (character.charType == Utils.CHARACTER_TYPE.TOWNSFOLK || character.charType == Utils.CHARACTER_TYPE.SOLDIER))
                // || ((agent.charType == Utils.CHARACTER_TYPE.TOWNSFOLK || agent.charType == Utils.CHARACTER_TYPE.SOLDIER) && character.charType == Utils.CHARACTER_TYPE.ALIEN))){
                if ((agent.charType == Utils.CHARACTER_TYPE.SOLDIER || agent.charType == Utils.CHARACTER_TYPE.TOWNSFOLK) 
                    && character.charType == Utils.CHARACTER_TYPE.ALIEN) {
                        enemies.push(character)
                }
                if (agent.charType == Utils.CHARACTER_TYPE.ALIEN) {
                    enemies.push(character)
                }
                
                
            }
	}
    return enemies[Math.floor(Math.random() * enemies.length)]
}

function orderAttack(character, time){
	if (character.order.target == null) {
		var target = findEnemy(character)
		if (target == null) {
			return false
		} else {
			character.order.updateTarget(target)
		}
	}
	// check if the character died
	if (character.order.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		console.log("order target died " + character.order.target.charName + character.order.target.state.stateType + time)
		return false
	}		

	// no need to check self hp
	// just do what the order ask

	// check attack range
	var target = character.order.target
	var distance = Math.abs(character.position[0] - target.position[0]) + Math.abs(character.position[1] - target.position[1])
	if (distance > character.attackRange) {
		// incapacitated, can not move
		if (character.healthState < Utils.HEALTH_STATES.INCAPACITATED && character.healthState > Utils.HEALTH_STATES.DIED) {
			console.log("order agent incapacitated")
			return false
		}
		// this frame still need to move
		console.log("order -> chase")
		character.orderChase(time)
		return false
	}
	const Logger = require('../Logger.js').Logger
	Logger.info({
		N1: character.charName,
		L: "attacked",
		N2: target.charName,
		T: time,
		Note: "order"
	})
	return true
}

function orderChase(time){
	console.log("character base: order chase")
}
//--------- Intervene----------


module.exports = {
    moveOneStep,
    pickUpGear,
    dropInventory,
    attack,
	updateHealthState,
	heal,
	hasMediKit,
	calDistanceOfCharacters, 
	checkIsDied,
	getAvailableDirectionsForPatrol,
	getAwayTargetDirection,
	addOrder,
	checkOrder,
	removeOrder,
	findEnemy,
	orderAttack
}