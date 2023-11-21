
const utils = require('./Utils.js') 
const TownMap = require('./Map/TownMap.js').TownMap
const CharactersManager = require('./Character/CharactersManager.js');
const jssim = require('js-simulator')
const Scheduler = require('./Scheduler.js')
const TempMap = require('./Map/TempMap.js').TempMap


function main(){
	
	var steps = 0;
	// var map = TownMap.getInstance(utils.MAP_SIZE);
	// map.createRandomMap()

	// CharactersManager.generateAllCharacters();

	var map = TempMap.getInstance()
	var charArray = CharactersManager.generateTempChar()

	// js-simulator
	// var evt = new jssim.SimEvent(1);
	// evt.id = 100
	// evt.update = function(deltaTime){
	// 	CharactersManager.charTempWander(charArray);
	// }
	// var startTime = 5
	// var interval = 1
	// // scheduler.scheduleRepeatingIn(evt, interval)
	// Scheduler.scheduler.scheduleRepeatingIn(evt, interval)

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