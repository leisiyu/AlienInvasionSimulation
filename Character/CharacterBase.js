const MapManager = require("../Map/MapManager.js")
const Utils = require('../Utils.js') 
const CharactersData = require("./CharactersData.js")
const DramaManagerData = require("../DramaManager/DramaManagerData.js")
const { Order } = require("../DramaManager/Order.js")
const Logger = require('../Logger.js').Logger
const OrderPriority = require('../DramaManager/Priority.js')

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

// function chase(character, time){
// 	var targetWidth = 1
// 	var targetHeight = 1

// 	const Logger = require('../Logger.js').Logger
// 	if (character.state.target.objType == "building") {
// 		targetWidth = character.state.target.size[0]
// 		targetHeight = character.state.target.size[1]
// 		Logger.info({
// 			N1: character.charName,
// 			L: "is moving to",
// 			N2: character.state.target.getName(),
// 			T: time,
// 		})
// 	} else {
// 		Logger.info({
// 			N1: character.charName,
// 			L: "is chasing",
// 			N2: character.state.target.charName,
// 			T: time,
// 		})
// 	}
	
// 	var position = character.state.target.position
// 	character.lastDirection = ""
// 	for (let j = 0; j < character.speed; j++){
// 		var availableDirections = []
// 		var horizontalOffset = position[0] - this.position[0]
// 		if ( horizontalOffset > targetWidth) {
// 			availableDirections.push(Utils.DIRECTION[3])
// 		} else if (horizontalOffset < -targetWidth) {
// 			availableDirections.push(Utils.DIRECTION[2])
// 		}
// 		var verticalOffset = position[1] - this.position[1]
// 		if (verticalOffset > targetHeight) {
// 			availableDirections.push(Utils.DIRECTION[1])
// 		} else if (verticalOffset < -targetHeight) {
// 			availableDirections.push(Utils.DIRECTION[0])
// 		}
// 		if (availableDirections.length > 0) {
// 			character.moveOneStep(availableDirections, time)
// 		}
		
// 	}

// 	Logger.statesInfo(JSON.stringify({
// 		N: character.charName,
// 		S: character.state.stateType, 
// 		P: character.position,
// 		T: time,
// 	}))

// 	if (Math.abs(character.position[0] - position[0]) + Math.abs(character.position[1] - position[1]) <= character.attackRange) {
// 		var characterName = character.state.target.charName
// 		character.state.updateState(Utils.CHARACTER_STATES.ATTACK)
// 	}
// }

function attack(character, time){
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
			Logger.statesInfo(JSON.stringify({
				N: character.charName,
				S: Utils.CHARACTER_STATES.PATROL, 
				P: character.position,
				T: time
			}))
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
			Logger.statesInfo(JSON.stringify({
				N: character.charName,
				S: Utils.CHARACTER_STATES.CHASE, 
				P: character.position,
				T: time
			}))
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
				Logger.statesInfo(JSON.stringify({
					N: character.charName,
					S: Utils.CHARACTER_STATES.ATTACK, 
					P: character.position,
					T: time
				}))
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

		Logger.info({
            N1: character.charName,
            L: "attacks",
            N2: target.charName,
            T: time,
        })
		Logger.statesInfo(JSON.stringify({
			N: character.charName,
			S: Utils.CHARACTER_STATES.ATTACK, 
			P: character.position,
			T: time
		}))
        return [true]
    } else {
        Logger.info({
            N1: character.charName,
            L: "attacks",
            N2: target.charName,
            T: time,
        })
		Logger.statesInfo(JSON.stringify({
			N: character.charName,
			S: Utils.CHARACTER_STATES.ATTACK, 
			P: character.position,
			T: time
		}))
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

function heal(healIdx, charName, targetName, medikit, inventory, position, time, isOrder = false){
	Logger.statesInfo(JSON.stringify({
		N: charName,
		S: Utils.CHARACTER_STATES.HEAL, 
		P: position,
		T: time
	}))

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
		var logInfo = {
            N1: charName,
            L: "is healing",
            N2: targetName,
            T: time,
        }
		if (isOrder) {
			logInfo["Note"] = "order"
		}
		Logger.info(logInfo)
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
	if (inventory == null || inventory.length <= 0) {return [false]}

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

function getApproachTargetDirection(position, targetPosition, targetWidth = 1, targetHeight = 1){
	var towardsDir = []
	if (position[0] == targetPosition[0] && position[1] == targetPosition[1]){
		return towardsDir
	}

	if (position[0] - targetPosition[0] > targetWidth) {
		towardsDir.push(Utils.DIRECTION[2])
	} else if (position[0] - targetPosition[0] < targetWidth) {
		towardsDir.push(Utils.DIRECTION[3])
	} else {
		towardsDir.push(Utils.DIRECTION[2])
		towardsDir.push(Utils.DIRECTION[3])
	}

	if (position[1] - targetPosition[1] > targetHeight) {
		towardsDir.push(Utils.DIRECTION[0])
	} else if (position[1] - targetPosition[1] < targetHeight) {
		towardsDir.push(Utils.DIRECTION[1])
	} else {
		towardsDir.push(Utils.DIRECTION[0])
		towardsDir.push(Utils.DIRECTION[1])
	}

	return towardsDir
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

function addOrder(character, target, order, time){
	const ORDER_TYPE = require("../DramaManager/Order.js").ORDER_TYPE
	if (target == null) {
		switch(order.orderType){
			case ORDER_TYPE.ATTACK:
			case ORDER_TYPE.CHASE:
				target = findEnemy(character, order, time)
				break
			case ORDER_TYPE.KILLED:
				target = findEnemy(character, order, time)
				break
			case ORDER_TYPE.MOVE:
				// TO DO: find????
				// enemy or ally
				// chasing is enemy
				break
			case ORDER_TYPE.HEAL:
				target = findAlly(character, order, time)
				break
			case ORDER_TYPE.RUN_AWAY:
				break
		}
		order.updateTarget(target)
	}
	if (target == null) {
		// abandon this turn
		// console.log("target nil")
		return
	}
	
	// push order to agent's order list
	// if (character.order == null) {
	order.updatePriority(OrderPriority.calculatePriority(order, character, target, time))
	character.orders.push(order)
	// console.log("add order: " + DramaManagerData.getIssuedOrderNumber() + " " + order.orderType + " priority " + order.priority)
	// console.log("add order " + order.orderType + " " + character.charName + " to " + order.target.charName)
	// record orders
	DramaManagerData.recordIssuedOrder(character.charName, order, time)
	// }
} 

function checkOrder(character){
	if (character.orders.length != 0
		&& character.order != null
		&& character.order.isExecuted()){		
		removeOrder(character)
	}
}

function removeOrder(character){
	character.orders = []
	character.order = null
	console.log("ORDER REMOVED: " + character.charName + character.orders.length == 0)
}

function checkIsNeutralState(state){
	for (let i = 0; i < Utils.NEUTRAL_STATES.length; i++){
		if (state.stateType == Utils.NEUTRAL_STATES[i]) { return true}
	}
	return false
}

/// Find an enemy nearby
function findEnemy(agent, order, time){
	if (agent == null) {
		return null
	}

	// check if there's a target in the last run
	var target = DramaManagerData.getTargetFromLastOrder(agent, order, time)
	if (target != null
		&& target.state.stateType != Utils.CHARACTER_STATES.DIED) {

		// console.log("find enemy target from previous order" + agent.charName + " " + target.charName + " " + time)
		return target
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
			&& character.objType != agent.objType
			&& checkIsNeutralState(character.state)){
			// && ((agent.objType == Utils.CHARACTER_TYPE.ALIEN && (character.objType == Utils.CHARACTER_TYPE.TOWNSFOLK || character.objType == Utils.CHARACTER_TYPE.SOLDIER))
                // || ((agent.objType == Utils.CHARACTER_TYPE.TOWNSFOLK || agent.objType == Utils.CHARACTER_TYPE.SOLDIER) && character.objType == Utils.CHARACTER_TYPE.ALIEN))){
                if ((agent.objType == Utils.CHARACTER_TYPE.SOLDIER || agent.objType == Utils.CHARACTER_TYPE.TOWNSFOLK) 
                    && character.objType == Utils.CHARACTER_TYPE.ALIEN) {
                        enemies.push(character)
                }
                if (agent.objType == Utils.CHARACTER_TYPE.ALIEN
					&& !MapManager.getMap().checkIsInABuilding(character.position)
				) {
                    enemies.push(character)
                }
                
                
            }
	}

	// find the nearest first
	if (enemies.length == 0) { return null}

	var distances = []
	for (let i = 0; i < enemies.length; i++){
		var enemy = enemies[i]
		var distance = Math.abs(agent.position[0] - enemy.position[0]) + Math.abs(agent.position[1] - enemy.position[1])
		distances.push(distance)
	}

	
    return enemies[distances.indexOf(Math.min(distances))]
}

function findAlly(agent, order, time){
	if (agent == null) {
		return null
	}

	// check if there's a target in the last run
	var target = DramaManagerData.getTargetFromLastOrder(agent, order, time)
	if (target != null
		&& target.state.stateType != Utils.CHARACTER_STATES.DIED) {
			console.log("find ally target from previous order" + agent.charName + " " + target.charName + " " + time)
			return target
	}

	var range = 15
	var startX = agent.position[0] - range < 0 ? 0 : agent.position[0] - range
	var endX = agent.position[0] + range >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : agent.position[0] + range
	var startY = agent.position[1] - range < 0 ? 0 : agent.position[1] - range
	var endY = agent.position[1] + range >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : agent.position[1] + range

	var allies = []
	for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		var characterPos = character.position
		if (character.state.stateType != Utils.CHARACTER_STATES.DIED 
			&& characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.charName != agent.charName
			&& checkIsNeutralState(character.state)){
				if ((agent.objType == Utils.CHARACTER_TYPE.SOLDIER || agent.objType == Utils.CHARACTER_TYPE.TOWNSFOLK) 
					&& (character.objType == Utils.CHARACTER_TYPE.SOLDIER || character.objType == Utils.CHARACTER_TYPE.TOWNSFOLK)) {
						allies.push(character)
				}
				if (agent.objType == Utils.CHARACTER_TYPE.ALIEN
					&& character.objType == Utils.CHARACTER_TYPE.ALIEN) {
					allies.push(character)
				}
			}
	}

	if (allies.length == 0) {
		return null
	}

	// find the nearest ally
	var minDistance = Infinity
	var nearestAlly = null
	for (let i = 0; i < allies.length; i++) {
		var ally = allies[i]
		var distance = Math.abs(agent.position[0] - ally.position[0]) + Math.abs(agent.position[1] - ally.position[1])
		if (distance < minDistance) {
			minDistance = distance
			nearestAlly = ally
		}
	}

	return nearestAlly
}

function orderAttack(character, time){
	if (character.order.target == null) {
		var target = findEnemy(character, character.order, time)
		if (target == null) {
			return false
		} else {
			character.order.updateTarget(target)
		}
	} 

	// check if the character died
	if (character.order.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		// console.log("order target died " + character.order.target.charName + " " + character.order.target.state.stateType + " " + time)
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
			// console.log("order agent incapacitated")
			return false
		}
		// this frame still need to move
		// console.log("order: attack -> chase")
		// IMPORTANT: call base-level orderChase to avoid double-counting the same order execution.
		// Using character.orderChase(time) here would invoke CharacterBase.executeOrderBase again
		// via the character-specific wrapper (Alien/Soldier/Townfolk), resulting in the same
		// Order instance (same orderId) being recorded twice in DramaManagerData.
		orderChase(character, time)
		return false
	}

	Logger.info({
		N1: character.charName,
		L: "attacks",
		N2: target.charName,
		T: time,
		Note: "order"
	})

	// console.log("order success: attack")
	character.state.setState(Utils.CHARACTER_STATES.ATTACK, character.order.target)

	return true
}


function orderChase(character, time, usePosInfo = false){
	// all the needed infomation have been sent to the agent
	// but in the first a few attemps, the target's position info is not allowed to use
	// so the "usePosInfo" is default to be false
	// after that can lead the agent to the exact position

	// console.log("character base: order chase")
	if (character.order.target == null || character.order.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		return false
	}

	var targetWidth = 1
	var targetHeight = 1
	
	if (character.order.target.objType == "building") {
		Logger.info({
			N1: character.charName,
			L: "is moving to",
			N2: character.order.target.getName(),
			T: time,
			Note: "order"
		})
		var buildingSize = character.order.target.size
		targetWidth = buildingSize[0]
		targetHeight = buildingSize[1]
	} else {
		Logger.info({
			N1: character.charName,
			L: "is chasing",
			N2: character.order.target.charName,
			T: time,
			Note: "order"
		})
	}
	// Logger.orderInfo({
	// 	Type: character.order.orderType,
	// 	Agent: character.charName,
	// 	Target: character.order.target && (character.order.target.charName || character.order.target.getName()),
	// 	Note: "chase",
	// 	MatchID: character.order.partialMatchId,
	// 	OrderId: character.order.orderId,
	// 	T: time
	// })
	
	var [visibleCharacters, visibleBuildings] = character.checkVisualRange()

	var visibleIdx = visibleCharacters.indexOf(character.order.target)
	if (visibleIdx != -1
		|| usePosInfo == true) {
		// if within visual range, chase it directly
		// if the order has percisely target position info, chase it directly

		position = character.order.target.position
			
		for (let j = 0; j < character.speed; j++){
			var availableDirections = []
			var horizontalOffset = position[0] - character.position[0]
			if ( horizontalOffset > targetWidth) {
				availableDirections.push(Utils.DIRECTION[3])
			} else if (horizontalOffset < -targetWidth) {
				availableDirections.push(Utils.DIRECTION[2])
			}
			var verticalOffset = position[1] - character.position[1]
			if (verticalOffset > targetHeight) {
				availableDirections.push(Utils.DIRECTION[1])
			} else if (verticalOffset < -targetHeight) {
				availableDirections.push(Utils.DIRECTION[0])
			}
			if (availableDirections.length > 0) {
				character.moveOneStep(availableDirections, time)
			}
			
		}
	} else {
		// TO DO: randomly go somewhere and check if can get the position
		for (let j = 0; j < character.speed; j++){
			var availableDirections = getAvailableDirectionsForPatrol(character.position, character.objType)
			if (availableDirections.length > 0) {
				character.moveOneStep(availableDirections, time)
			}
		}
		
	}

	Logger.statesInfo(JSON.stringify({
		N: character.charName,
		S: character.state.stateType, 
		P: character.position,
		T: time,
		Note:"order"
	}))

	// console.log("order success: chase")
	character.state.setState(Utils.CHARACTER_STATES.CHASE, character.order.target)
	return true
}

function orderHeal(character, time, usePosInfo = false){
	
	// if doesn't have a medikit, go and find one first
	var medikitResult = hasMediKit(character.inventory)
	if (!medikitResult[0]) {
		console.log("find medikit first!!!!!!")
		orderFindMedikit(character, time, usePosInfo)
		return [false]
	}

	var target = character.order.target
	var distance = Math.abs(character.position[0] - target.position[0]) + Math.abs(character.position[1] - target.position[1])

	if (distance <= 2) {
		// heal the target
		console.log("start healing")
		if (character.healingIdx >= Utils.HEAL_STEP) {
			character.healingIdx = 0
			return [false]
		}
	
		heal(character.healingIdx, character.charName, character.order.target.charName, medikitResult[1], character.inventory, time, true)
		character.state.setState(Utils.CHARACTER_STATES.HEAL, target)

		// Logger.orderInfo({
		// 	Type: character.order.orderType,
		// 	Agent: character.charName,
		// 	Target: character.order.target.charName,
		// 	Note: "heal",
		// 	MatchID: character.order.partialMatchId,
		// 	OrderId: character.order.orderId,
		// 	T: time
		// })

		return [true, medikitResult[1].value]
	}

	if (distance <= character.visualRange || usePosInfo) {
		//move to the target first
		console.log("move to the target (within visual range)")
		for (let j = 0; j < character.speed; j++){
			var availableDirections = getApproachTargetDirection(character.position, target.position)
			if (availableDirections.length > 0) {
				//TO DO: doesn't have a MOVE TO state
				character.state.setState(Utils.CHARACTER_STATES.PATROL)
				character.moveOneStep(availableDirections, time)
			}

			if (Math.abs(character.position[0] - target.position[0]) + Math.abs(character.position[1] - target.position[1]) <= 2) {
				break
			}
		}

		// Logger.orderInfo({
		// 	Type: character.order.orderType,
		// 	Agent: character.charName,
		// 	Target: character.order.target.charName,
		// 	Note: "within the visual range, move to the target",
		// 	MatchID: character.order.partialMatchId,
		// 	OrderId: character.order.orderId,
		// 	T: time
		// })
		return [false]

	} else{
		//find the target first
		console.log("move to the target (out of visual range)")
		for (let j = 0; j < character.speed; j++){
			var availableDirections = Utils.DIRECTION
			if (Math.abs(character.position[0] - target.position[0]) + Math.abs(character.position[1] - target.position[1]) <= character.visualRange) {
				availableDirections = getApproachTargetDirection(character.position, target.position)
			}
			
			if (availableDirections.length > 0) {
				character.moveOneStep(availableDirections, time)
				character.state.setState(Utils.CHARACTER_STATES.PATROL)
			}
		}
		
		// Logger.orderInfo({
		// 	Type: character.order.orderType,
		// 	Agent: character.charName,
		// 	Target: character.order.target.charName,
		// 	Note: "out of the visual range, find the target first",
		// 	MatchID: character.order.partialMatchId,
		// 	OrderId: character.order.orderId,
		// 	T: time
		// })
		return [false]
	}
}

function orderRunAway(character, target, time){
	if (character.order.target == null) { return false}

	if (character.healthState <= Utils.HEALTH_STATES.INCAPACITATED) {
		return false
	}

	Logger.info({
		N1: character.charName,
		L: "runs away from",
		N2: target.charName,
		T: time,
		Note: "order",
	})
	// Logger.orderInfo({
	// 	Type: character.order.orderType,
	// 	Agent: character.charName,
	// 	Target: character.order.target && (character.order.target.charName || character.order.target.getName()),
	// 	Note: "runs away",
	// 	MatchID: character.order.partialMatchId,
	// 	OrderId: character.order.orderId,
	// 	T: time
	// })

	for (let i = 0; i < character.speed; i++) {
		var oppositDir = getAwayTargetDirection(character.objType, character.position, target)
		var result = character.moveOneStep(oppositDir, time)
		character.lastDirection = ""
	}
	character.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, target)

	Logger.statesInfo(JSON.stringify({
		N: character.charName,
		S: character.state.stateType, 
		P: character.position,
		T: time,
	}))

	// run away succeed
	var distance = Math.abs(character.position[0] - target.position[1]) + Math.abs(character.position[1] - target.position[1])
	if ( distance >= character.visualRange) {
		var target = character.state.target

		Logger.info({
			N1: this.charName,
			L: "successfully ran away from",
			N2: target.charName,
			T: this.time
		})
		character.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	}
	return true
}

function orderFindMedikit(character, time, usePosInfo){
	
	// Logger.orderInfo({
	// 	Type: character.order.orderType,
	// 	Agent: character.charName,
	// 	Target: character.order.target.charName,
	// 	Note: "find medikit first",
	// 	MatchID: character.order.partialMatchId,
	// 	OrderId: character.order.orderId,
	// 	T: time
	// })

	if (usePosInfo){
		var medikit = MapManager.getNearestMedikitPos(character.position)

		for (let j = 0; j < character.speed; j++){
			var availableDirections = getApproachTargetDirection(character.position, medikit.mapPosition)
			if (availableDirections.length > 0) {
				character.moveOneStep(availableDirections, time)
			}
		}
		return
	}

	//TO DO: search building
	//At this moment: wandering around
	console.log("find medikit without position info")
	for (let j = 0; j < character.speed; j++){
		var availableDirections = Utils.DIRECTION
		if (availableDirections.length > 0) {
			character.moveOneStep(availableDirections, time)
		}
	}
}

function orderFindAWeapon(character, time, usePosInfo = false){
	// console.log("find a weapon")

	// Logger.orderInfo({
	// 	Type: character.order.orderType,
	// 	Agent: character.charName,
	// 	Target: character.order.target.charName,
	// 	Note: "find a weapon first",
	// 	MatchID: character.order.partialMatchId,
	// 	OrderId: character.order.orderId,
	// 	T: time
	// })

	if (usePosInfo){
		var weapon = MapManager.getNEarestWeaponPos(character.position)

		for (let j = 0; j < character.speed; j++){
			var availableDirections = getApproachTargetDirection(character.position, weapon.mapPosition)
			if (availableDirections.length > 0) {
				character.moveOneStep(availableDirections, time)
			}
		}
		return
	}

	//At this moment: wandering around
	// console.log("find weapon without position info")
	for (let j = 0; j < character.speed; j++){
		var availableDirections = Utils.DIRECTION
		if (availableDirections.length > 0) {
			character.moveOneStep(availableDirections, time)
		}
	}
}

function executeOrderBase(agentName, order, time){
	DramaManagerData.recordExecutedOrders(agentName, order, time)
}

function chooseOrderWithHighestPriority(orders){
	if (orders.length == 0) {return}

	const priorities = orders.map(order => order.priority)
	let maxPriority = Math.max(...priorities)
	let topOrder = orders.find(order => order.priority == maxPriority)

	return topOrder
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
	getApproachTargetDirection,
	addOrder,
	checkOrder,
	removeOrder,
	findEnemy,
	orderAttack,
	orderChase,
	orderHeal,
	orderRunAway,
	executeOrderBase,
	orderFindAWeapon,
	chooseOrderWithHighestPriority
}