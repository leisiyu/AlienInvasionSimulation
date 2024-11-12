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
    if (gear != false) {
        pickUpGear(gear, inventory)
        Logger.info({
			"N1": charName,
			"L": "picked up",
			"N2": "gear " + gear.name,
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

function setState(state, character, target){
    character.state.updateState(state, target)
}

module.exports = {
    moveOneStep,
    pickUpGear,
}