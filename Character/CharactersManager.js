const TownMap = require("../Map/TownMap").TownMap;
const Townfolk = require('./Townfolk').Townfolk;
const utils = require('../Utils.js') 


const townfolks = [];

function generateTownfolks() {
	var populationSize = utils.TOWNFOLKS_NUM;
	for (let i = 0; i < populationSize; i++) {
		var pos = TownMap.getInstance(utils.MAP_SIZE).generateRandomPos();
		var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		console.log('random name ' + randomName);
		townfolks[i] = new Townfolk(randomName, pos);
		console.log("pos is " + townfolks[i].position);
	}
}

function townfolksWander() {
	for (let i = 0; i < townfolks.length; i++) {
		townfolks[i].walkWithRandomDirection();
	}
}


module.exports = {
	generateTownfolks,
	townfolks,
	townfolksWander,
}