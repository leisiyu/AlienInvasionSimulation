
const utils = require('./Utils.js') 
const TownMap = require('./Map/TownMap.js').TownMap
const CharactersManager = require('./Character/CharactersManager.js');

function main(){
	var steps = 0;
	var map = TownMap.getInstance(utils.MAP_SIZE);
	// console.log("the pos is " + map.generateRandomPos())
	CharactersManager.generateTownfolks();


	while (steps < utils.TOTAL_STEPS) {
		// console.log("the steps number is " + steps);
		CharactersManager.townfolksWander();
		steps++;
	}

	// console.log("map !!!" + TownMap.getInstance().map);
	// for (let i = 0; i < 5; i++){
	// 	for (let j = 0; j < 5; j++){
	// 		var objjj = TownMap.getInstance().map[i][j];
	// 		console.log('object ', objjj);
			
	// 	}
	// }
}






main()