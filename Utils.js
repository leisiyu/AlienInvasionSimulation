// const Config = require('./Config')

const TOTAL_STEPS = 10
var MAP_SIZE = [50, 50]
var TOWNFOLKS_NUM = 5
var ALIENS_NUM = 5
var SOLIDERS_NUM = 5

function initParameters(townfolkNum, alienNum, soldierNum, mapSize){
	this.TOWNFOLKS_NUM = townfolkNum != undefined ? Number(townfolkNum): TOWNFOLKS_NUM
	this.ALIENS_NUM = alienNum != undefined ? Number(alienNum) : ALIENS_NUM
	this.SOLIDERS_NUM = soldierNum != undefined ? Number(soldierNum) : SOLIDERS_NUM
	this.MAP_SIZE = mapSize != undefined ? JSON.parse(mapSize) : MAP_SIZE
}

const CHARACTER_TYPE = {
	TOWNFOLK: 'TOWNFOLK',
	ALIEN: 'ALIEN',
	SOLDIER: 'SOLDIER',
}

const TOWNFOLK_NAMES = [
	'Bob',
	'John',
	'Jane',
	'Tom',
	'Olivia',
	'Ben',
	'Hannah',
	'Anthothy',
	'Keke',
	'Elena',
	'Harry',
	'George',
	'Henry',
	'Ali',
	'Edward',
	'Roy',
	'Jamie',
]

const DIRECTION = [
	'UP',
	'DOWN',
	'LEFT',
	'RIGHT',
]

// const CHARACTER_MISSION = {
// 	PATROL: 'PATROL',
// 	CHASE: 'CHASE',
// 	// REVENGE: 'REVENGE',
// 	// BUY: 'BUY',
// 	DESTROY: 'DESTROY',
// 	RUN_AWAY: 'RUN_AWAY',
// 	FIGHT_BACK: 'ATTACK',
// 	// TREAT: 'TREAT',
// }

const CHARACTER_STATES = {
	// NORMAL: "normal",
	// HURT: "hurt",
	DIED: "DIED",
	PATROL: 'PATROL',
	CHASE: 'CHASE',
	DESTROY: 'DESTROY',
	RUN_AWAY: 'RUN_AWAY',
	ATTACK: 'ATTACK',
	HIDE: 'HIDE',
	WANDER: "WANDER",
	MOVE_TO: "MOVE_TO",
}

const formatString = (template, ...args) => {
	return template.replace(/{([0-9]+)}/g, function (match, index) {
	  return typeof args[index] === 'undefined' ? match : args[index];
	});
}

// const log4js = require('log4js')
// const logger = log4js.getLogger("Log")
// // logger.level = "debug"
// log4js.configure({
// 	appenders: { output: { type: "file", filename: "output.log" } },
// 	categories: { default: { appenders: ["output"], level: "debug" } },
// });

module.exports = {
	TOTAL_STEPS,
	MAP_SIZE,
	TOWNFOLKS_NUM,
	ALIENS_NUM,
	SOLIDERS_NUM,
	TOWNFOLK_NAMES,
	CHARACTER_TYPE,
	DIRECTION,
	formatString,
	CHARACTER_STATES,
	initParameters,
}