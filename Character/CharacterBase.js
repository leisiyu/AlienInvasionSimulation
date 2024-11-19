const MapManager = require("../Map/MapManager.js")
const Utils = require('../Utils.js') 
const Logger = require('../Logger.js').Logger


//availableDirections can not be empty
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
				// if (i == idx) {
				// 	newWeights.push(30)
				// } else (
				// 	newWeights.push(10)
				// )
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
        // console.log("hahahahahahhahahahahahhahaha    ")
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
			"L": "picked up",
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
    // check if the character died
	if (character.state.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		
		character.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		character.wander(time)
		return [false]
	}		

	// check attack range
	var target = character.state.target
	var distance = Math.abs(character.position[0] - target.position[0]) + Math.abs(character.position[1] - target.position[1])
	if (distance > character.attackRange) {
		// this frame still need to move
		if (distance > character.visualRange) {
			Logger.info({
				N1: character.charName,
				L: "target ran away, started to patrol",
				N2: target.charName,
				T: time,
			})
			character.state.setState(Utils.CHARACTER_STATES.PATROL, null)
			character.wander(time)
		} else {
			Logger.info({
				N1: character.charName,
				L: "target is out of attack range, started to chase",
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
                Logger.info({
                    N1: character.charName,
                    L: "shot",
                    N2: target.charName,
                    T: time,
                })
                var isAvailable = weapon.use()
                if (!isAvailable) {
                    character.inventory.splice(i, 1)
                    Logger.info({
                        "N1": weapon.name,
                        "L": "was broken",
                        "N2": "",
                        "T": time,
                    })
                }
                return [true, weapon]
            }
        }
    } else {
        Logger.info({
            N1: character.charName,
            L: "attacked",
            N2: target.charName,
            T: time,
        })
        return [true]
    }
	
}

module.exports = {
    moveOneStep,
    pickUpGear,
    dropInventory,
    attack
}