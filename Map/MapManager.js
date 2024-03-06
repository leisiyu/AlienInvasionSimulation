
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

module.exports = {
    generateMap,
    getMap,
}