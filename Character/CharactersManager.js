const TownMap = require("../Map/TownMap").TownMap;
const Townfolk = require('./Townfolk').Townfolk;
const utils = require('../Utils.js') 


const townfolks = [];
const aliens = [];
const soldiers = [];

function generateTownfolks() {
	var populationSize = utils.TOWNFOLKS_NUM;
	generateCharacters(populationSize);
}

function generateAliens() {
	var populationSize = utils.ALIENS_NUM;
	generateCharacters(populationSize);
}

function generateSoldiers() {
	var populationSize = utils.SOLIDERS_NUM;
	generateCharacters(populationSize);
}

function generateCharacters(populationSize){

	for (let i = 0; i < populationSize; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		townfolks[i] = new Townfolk(randomName, pos);
		TownMap.getInstance().updateObjectOnTheMap(townfolks[i], [], pos);
	}
}

function generateAllCharacters(){
	generateTownfolks();
	generateAliens();
	generateSoldiers();
}

function townfolksWander() {
	for (let i = 0; i < townfolks.length; i++) {
		const oldPosition = JSON.parse(JSON.stringify(townfolks[i].position));
		// console.log("old " + oldPosition);
		townfolks[i].walkWithRandomDirection();
		TownMap.getInstance().updateObjectOnTheMap(townfolks[i], oldPosition, townfolks[i].position);
		// console.log("position!!! " + oldPosition + townfolks[i].position);
	}
}

function charactersWander(charType){
	var characterArray = [];
	switch (charType) {
		case utils.CHARACTER_TYPE[0]:
			characterArray = townfolks;
			break;
		case utils.CHARACTER_TYPE[1]:
			break;
		case utils.CHARACTER_TYPE[2]:
			break;
	}
	for (let i = 0; i < townfolks.length; i++) {
		const oldPosition = JSON.parse(JSON.stringify(townfolks[i].position));
		// console.log("old " + oldPosition);
		townfolks[i].walkWithRandomDirection();
		TownMap.getInstance().updateObjectOnTheMap(townfolks[i], oldPosition, townfolks[i].position);
		// console.log("position!!! " + oldPosition + townfolks[i].position);
	}
}

function checkEvents() {
	for (let i = 0; i < utils.MAP_SIZE[0]; i++) {
		for (let j = 0; j < utils.MAP_SIZE[1]; j++){

		}
	}
}

module.exports = {
	generateAllCharacters,
	townfolks,
	townfolksWander,
}