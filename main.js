
utils = require('./Utils.js') 
TownMap = require('./Map/TownMap.js').TownMap

function main(){
	var steps = 0;
	var map = new TownMap(utils.MAP_SIZE[0], utils.MAP_SIZE[1])

	console.log("the pos is " + map.generateRandomPos())


	while (steps < utils.TOTAL_STEPS) {
		console.log("the steps is")
		steps++;
	}
}






main()