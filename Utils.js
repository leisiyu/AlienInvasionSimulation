// const Config = require('./Config')


const CHARACTER_TYPE = {
	TOWNFOLK: 'TOWNFOLK',
	ALIEN: 'ALIEN',
	SOLDIER: 'SOLDIER',
}


var TOTAL_CHARACTERS = 20
var CHARACTER_RATIO = [8, 1, 1]
const TOTAL_STEPS = 10
var MAP_SIZE = [50, 50]
var TOWNFOLKS_NUM = getNumberByRatio(CHARACTER_TYPE.TOWNFOLK)
var ALIENS_NUM = getNumberByRatio(CHARACTER_TYPE.ALIEN)
var SOLIDERS_NUM = getNumberByRatio(CHARACTER_TYPE.SOLDIER)
var TIME_STEPS = 10000

function initParameters(totalCharacters, characterRatio, mapSize, timeSteps){
	TOTAL_CHARACTERS = totalCharacters != undefined ?  Number(totalCharacters) : TOTAL_CHARACTERS
	this.TOTAL_CHARACTERS = TOTAL_CHARACTERS
	CHARACTER_RATIO = characterRatio != undefined ? JSON.parse(characterRatio) : CHARACTER_RATIO
	this.CHARACTER_RATIO = CHARACTER_RATIO
	TIME_STEPS = timeSteps != undefined ? Number(timeSteps) : TIME_STEPS
	this.TIME_STEPS = TIME_STEPS

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

const GEAR_TYPES = [
	"HEAL",
	"WEAPON",
]

const HEALS = {
	MEDICINE: {
		value:[5, 20],
		durability: 3,
	},
	BANDAGE: {
		value: [3, 5],
		durability: 5,
	},
}

const WEAPONS = {
	GUN: {
		value: [50, 100],
		durability: 25,
	},
	RIFLE: {
		value: [100, 200],
		durability: 50,
	}
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
	CHARACTER_RATIO,
	TOTAL_CHARACTERS,
	TIME_STEPS,
	GEAR_TYPES,
	HEALS,
	WEAPONS,
}