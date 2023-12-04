
const Utils = require('./Utils.js') 
const TownMap = require('./Map/TownMap.js').TownMap
const CharactersManager = require('./Character/CharactersManager.js');
const jssim = require('js-simulator')
const Scheduler = require('./Scheduler.js')
const TempMap = require('./Map/TempMap.js').TempMap


// var scheduler = new jssim.Scheduler();

function main(){
	
	// var map = TownMap.getInstance(Utils.MAP_SIZE);
	// map.createRandomMap()

	// CharactersManager.generateAllCharacters();

	var map = TempMap.getInstance()
	map.createRandomMap()
	// CharactersManager.generateTempChar()
	CharactersManager.generateAllCharacters()

	Scheduler.updateEvents()
	

	// console.log("map !!!" + TownMap.getInstance().map);
	// for (let i = 0; i < 5; i++){
	// 	for (let j = 0; j < 5; j++){
	// 		var objjj = TownMap.getInstance().map[i][j];
	// 		console.log('object ', objjj);
			
	// 	}
	// }
}






main()