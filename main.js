
const utils = require('./Utils.js') 
const TownMap = require('./Map/TownMap.js').TownMap
const CharactersManager = require('./Character/CharactersManager.js');
// const jssim = require('js-simulator')
const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')

function main(){
	// var scheduler = new jssim.Scheduler();
	
	var steps = 0;
	var map = TownMap.getInstance(utils.MAP_SIZE);
	map.createRandomMap()
	for (var i = 0; i < utils.MAP_SIZE[0]; i++){
		console.log('map ' + map.map[i])
	}

	console.log('all rooms ' + map.allRooms.length)
	// CharactersManager.generateAllCharacters();

	// var evt = new jssim.SimEvent(1);
	// evt.id = 1
	// evt.update = function(deltaTime){
	// 	console.log("test")
	// 	CharactersManager.charactersWander();
	// }
	// var startTime = 1
	// var interval = 1
	// console.log("haha", evt)
	// scheduler.scheduleRepeatingIn(evt, interval)

	const scheduler = new ToadScheduler()
	const task = new Task('simple task', () => {
		// CharactersManager.charactersWander()
		steps++
		if (steps >= utils.TOTAL_STEPS) {
			scheduler.stop()
		}
	})
	const job = new SimpleIntervalJob({seconds: 2}, task)
	scheduler.addSimpleIntervalJob(job)

	// console.log("map !!!" + TownMap.getInstance().map);
	// for (let i = 0; i < 5; i++){
	// 	for (let j = 0; j < 5; j++){
	// 		var objjj = TownMap.getInstance().map[i][j];
	// 		console.log('object ', objjj);
			
	// 	}
	// }
}






main()