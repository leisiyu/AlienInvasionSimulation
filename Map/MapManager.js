
const TempMap = require('./TempMap.js').TempMap

var map

function generateMap(){
    map = TempMap.getInstance()
	map.createRandomMap()
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

module.exports = {
    generateMap,
    getMap,
    checkIsOnARoad,
    checkIsInABuilding,
    getBuilding,
}