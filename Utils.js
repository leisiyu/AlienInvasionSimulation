// const Config = require('./Config')


const CHARACTER_TYPE = {
	TOWNSFOLK: 'TOWNSFOLK',
	ALIEN: 'ALIEN',
	SOLDIER: 'SOLDIER',
}


var TOTAL_CHARACTERS = 60
var CHARACTER_RATIO = [1, 1, 1]   // alien:soldier:townsfolk
const TOTAL_STEPS = 10
var MAP_SIZE = [50, 50]
var TOWNFOLKS_NUM = getNumberByRatio(CHARACTER_TYPE.TOWNSFOLK)
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

	this.TOWNFOLKS_NUM = getNumberByRatio(CHARACTER_TYPE.TOWNSFOLK)
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
		case CHARACTER_TYPE.TOWNSFOLK:
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
	DIED: "DIED",
	PATROL: 'PATROL',
	CHASE: 'CHASE',
	DESTROY: 'DESTROY',
	RUN_AWAY: 'RUN_AWAY',
	ATTACK: 'ATTACK',
	HIDE: 'HIDE',
	WANDER: "WANDER",
	// MOVE_TO: "MOVE_TO",
	STAY: "STAY",
	HEAL: "HEAL",
}

const GEAR_TYPES = [
	"MEDIKIT",
	"WEAPON",
]

const HEALS = {
	MEDICINE: {
		value:[10, 30],
		durability: 30,
	},
	MEDIKIT: {
		value: [20, 70],
		durability: 20,
	},
}

const HEALTH_STATES = {
	NORMAL: 1,
	SCRATCHED: 0.9,
	HURT: 0.5,
	INCAPACITATED: 0.2,
	DIED: 0,
}

const WEAPONS = {
	GUN: {
		value: [100, 150],
		durability: 25,
	},
	RIFLE: {
		value: [150, 200],
		durability: 25,
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

const HEAL_STEP = 3

const ATTACK_TYPE = [
	"NORMAL",
	"CRITICAL_HIT"
]
const CRITICAL_HIT = 1.2

const GEAR_STATE = {
	NORMAL: "NORMAL",
	BROKEN: "BROKEN"
}

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
	HEALTH_STATES,
	HEAL_STEP,
	ATTACK_TYPE,
	CRITICAL_HIT,
	GEAR_STATE
}