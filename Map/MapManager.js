
const TempMap = require('./TempMap.js').TempMap
const Utils = require('../Utils.js')
const Gear = require('./Gear.js').Gear

var map
var gearsOnMap

function generateMap(){
    map = TempMap.getInstance()
	map.createRandomMap()
    gearsOnMap = []
    
    //generate random gear
    var randomNum = Math.floor(Math.random() * Utils.TOTAL_CHARACTERS * 0.3) + 1
    console.log("haha random gear num " + randomNum)
    for (let i = 0; i < randomNum; i++){
        randomGearInRandomPos(0)
    }
}

function getMap(){
    if (map == null) {
        generateMap()
    }
    return map
}

function checkIsOnARoad(position){
    return map.checkIsOnARoad(position)
}

function checkIsInABuilding(position){
    return map.checkIsInABuilding(position)
}

// function checkIsAccessibleToCharacter(position, characterType){
//     var result = MapManager.checkIsInABuilding(position)
//     if (result[0]) {
//         var buildingId = result[1]
//         var building = getBuilding(buildingId)
//         if (building.isAccessibleTo(characterType)) {
//             return true
//         } else {
//             return false
//         }
//     }
//     return false
// }

function getBuilding(idx) {
    return map.getBuilding(idx)
}

function getAllBuildings(){
    return map.buildings
}

function getRandomPosAroundPos(pos){
    var isInBuilding = checkIsInABuilding(pos)
    var minX = pos[0] - 1 >= 0? pos[0] - 1 : 0
    var maxX = pos[0] + 1 < Utils.MAP_SIZE[0] ? pos[0] + 1 : pos[0]
    var minY = pos[1] - 1 >= 0? pos[1] - 1 : 0
    var maxY = pos[1] + 1 < Utils.MAP_SIZE[1] ? pos[1] + 1 : pos[1]

    var validPos = []
    for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++){
            if ((isInBuilding && checkIsInABuilding([i, j])) || ((!isInBuilding) && (!checkIsInABuilding([i, j])))) {
                validPos.push([i, j])
            }
        }
    }

    return validPos
}

function randomGearInRandomPos(time){
    var gear = createRandomGear()
    var randomPos = map.generateRandomPos()
    if (gear.gearType == Utils.GEAR_TYPES[0]) {
        randomPos = map.generateRandomPosInBuilding()
        // console.log("hahaha " + randomPos)
    }
    gear.updateMapPosition(randomPos)

    // Lazy require Logger to avoid circular dependency
    const Logger = require('../Logger.js').Logger
    Logger.statesInfo(JSON.stringify({
		N: gear.name,
		S: "was generated in",
		P: gear.mapPosition,
		T: time
	}))

    gearsOnMap.push(gear)
}

function removeGearFromGearMap(gear){
    var idx = gearsOnMap.indexOf(gear)

    if (idx > -1) { 
        gearsOnMap.splice(idx, 1)
    }
}

function createRandomGear(){
    var randomType = Utils.GEAR_TYPES[Math.floor(Math.random() * Utils.GEAR_TYPES.length)]
    // var randomType = Utils.GEAR_TYPES[0]
    var gearSubtypes = {}
    switch (randomType) {
        case Utils.GEAR_TYPES[0]:
            gearSubtypes = Utils.HEALS
            break
        case Utils.GEAR_TYPES[1]:
            gearSubtypes = Utils.WEAPONS
            break
    }
    var keys = Object.keys(gearSubtypes)
    if (keys.length <= 0) {
        return
    }
    var randomSubType = keys[Math.floor(keys.length * Math.random())]
    var valueMin = gearSubtypes[randomSubType].value[0]
    var valueMax = gearSubtypes[randomSubType].value[1]
    var randomValue = Math.floor(Math.random() * (valueMax - valueMin + 1)) + valueMin
    var gear = new Gear(randomType, randomSubType, randomValue, gearSubtypes[randomSubType].durability)

    return gear
}

function checkHasGearOnPos(pos){
    if (gearsOnMap.length <= 0) {return false}

    for (let i = 0; i < gearsOnMap.length; i++) {
        gearPos = gearsOnMap[i].mapPosition
        
        if (gearPos[0] == pos[0] && gearPos[1] == pos[1]) {
            // console.log("hahahah3333 " + typeof(key))
            return gearsOnMap[i]
        }
    } 
    return false
}

function addGearOnMap(gear, pos) {
    gearsOnMap.push(gear)
    gear.updateMapPosition(pos)
}

module.exports = {
    generateMap,
    getMap,
    checkIsOnARoad,
    checkIsInABuilding,
    getBuilding,
    getAllBuildings,
    createRandomGear,
    randomGearInRandomPos,
    removeGearFromGearMap,
    checkHasGearOnPos,
    getRandomPosAroundPos,
    addGearOnMap,
}