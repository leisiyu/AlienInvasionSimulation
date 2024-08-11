
const Utils = require('./Utils.js') 
// const TownMap = require('./Map/TownMap.js').TownMap
const CharactersManager = require('./Character/CharactersManager.js');
const jssim = require('js-simulator')
const Scheduler = require('./Scheduler.js')
const MapManager = require('./Map/MapManager.js')
const Logger = require('./Logger.js').Logger


// var scheduler = new jssim.Scheduler();

function main(){
	var totalTimeSteps = process.argv[2]
	var totalCharacters = process.argv[3]
	var characterRatio = process.argv[4]
	// var soldierNum = process.argv[4]
	// var townfolkNum = process.argv[5]
	var mapSize = process.argv[5]
	Utils.initParameters(totalCharacters, characterRatio, mapSize, totalTimeSteps)

	var dirNameIdx = process.argv[6]
	Logger.setDirNameIdx(dirNameIdx)

	// var map = TownMap.getInstance(Utils.MAP_SIZE);
	// map.createRandomMap()

	// CharactersManager.generateAllCharacters();

	MapManager.generateMap()
	// CharactersManager.generateTempChar()
	CharactersManager.generateAllCharacters()

	Scheduler.updateEvents(totalTimeSteps)
	

	// console.log("map !!!" + TownMap.getInstance().map);
	// for (let i = 0; i < 5; i++){
	// 	for (let j = 0; j < 5; j++){
	// 		var objjj = TownMap.getInstance().map[i][j];
	// 		console.log('object ', objjj);
			
	// 	}
	// }
}






main()