
const TempMap = require('./TempMap.js').TempMap
const Utils = require('../Utils.js')
const Gear = require('./Gear.js').Gear
const Logger = require('../Logger.js').Logger

var map
var gearsOnMap

function generateMap(){
    map = TempMap.getInstance()
	map.createRandomMap()
    gearsOnMap = []
    
    ////////test//////
    for (let i = 0; i < 5; i++){
        randomGearInRandomPos(0)
    }
    /////////////////
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

function getBuilding(idx) {
    return map.getBuilding(idx)
}

function getAllBuildings(){
    return map.buildings
}

function randomGearInRandomPos(time){
    var gear = createRandomGear()
    var randomPos = map.generateRandomPos()
    gear.updateMapPosition(randomPos)

    Logger.statesInfo(JSON.stringify({
		N: gear.name,
		S: "was generated in",
		P: gear.position,
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
    randomSubType = keys[Math.floor(keys.length * Math.random())]
    valueMin = gearSubtypes[randomSubType].value[0]
    valueMax = gearSubtypes[randomSubType].value[1]
    randomValue = Math.floor(Math.random() * (valueMax - valueMin + 1)) + valueMin
    var gear = new Gear(randomType, randomValue, gearSubtypes[randomSubType].durability)

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
}