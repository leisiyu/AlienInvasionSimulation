// const Config = require('./Config')


const CHARACTER_TYPE = {
	TOWNFOLK: 'TOWNFOLK',
	ALIEN: 'ALIEN',
	SOLDIER: 'SOLDIER',
}


var TOTAL_CHARACTERS = 30
var CHARACTER_RATIO = [1, 1, 1]
const TOTAL_STEPS = 10
var MAP_SIZE = [100, 100]
var TOWNFOLKS_NUM = getNumberByRatio(CHARACTER_TYPE.TOWNFOLK)
var ALIENS_NUM = getNumberByRatio(CHARACTER_TYPE.ALIEN)
var SOLIDERS_NUM = getNumberByRatio(CHARACTER_TYPE.SOLDIER)

function initParameters(totalCharacters, characterRatio, mapSize){
	TOTAL_CHARACTERS = totalCharacters != undefined ?  Number(totalCharacters) : TOTAL_CHARACTERS
	CHARACTER_RATIO = characterRatio != undefined ? JSON.parse(characterRatio) : CHARACTER_RATIO
	this.TOWNFOLKS_NUM = getNumberByRatio(CHARACTER_TYPE.TOWNFOLK)
	this.ALIENS_NUM = getNumberByRatio(CHARACTER_TYPE.ALIEN)
	this.SOLIDERS_NUM = getNumberByRatio(CHARACTER_TYPE.SOLDIER)

	this.MAP_SIZE = mapSize != undefined ? JSON.parse(mapSize) : MAP_SIZE
}

function getNumberByRatio(characterType){
	var totalRatioSum = 0
	for (let i = 0; i < CHARACTER_RATIO.length; i++) {
		totalRatioSum = totalRatioSum + CHARACTER_RATIO[i]
	}
	var ratio = 0
	switch (characterType) {
		case CHARACTER_TYPE.TOWNFOLK:
			ratio = CHARACTER_RATIO[2] / totalRatioSum
			break
		case CHARACTER_TYPE.ALIEN:
			ratio = CHARACTER_RATIO[0] / totalRatioSum
			console.log("hahah3333 " + ratio + CHARACTER_RATIO)
			break
		case CHARACTER_TYPE.SOLDIER:
			ratio = CHARACTER_RATIO[1] / totalRatioSum
			break
	}
	return Math.floor(ratio * TOTAL_CHARACTERS)
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
	CHARACTER_RATIO
}