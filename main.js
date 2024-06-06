
const Utils = require('./Utils.js') 
// const TownMap = require('./Map/TownMap.js').TownMap
const CharactersManager = require('./Character/CharactersManager.js');
const jssim = require('js-simulator')
const Scheduler = require('./Scheduler.js')
const MapManager = require('./Map/MapManager.js')


// var scheduler = new jssim.Scheduler();

function main(){
	var alienNum = process.argv[3]
	var soldierNum = process.argv[4]
	var townfolkNum = process.argv[5]
	var mapSize = process.argv[6]
	Utils.initParameters(townfolkNum, alienNum, soldierNum, mapSize)

	// var map = TownMap.getInstance(Utils.MAP_SIZE);
	// map.createRandomMap()

	// CharactersManager.generateAllCharacters();

	MapManager.generateMap()
	// CharactersManager.generateTempChar()
	CharactersManager.generateAllCharacters()

	var totalTimeSteps = process.argv[2]
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