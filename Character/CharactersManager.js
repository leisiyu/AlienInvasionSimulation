const TownMap = require("../Map/TownMap").TownMap;
const TempMap = require('../Map/TempMap.js').TempMap
const Townfolk = require('./Townfolk').Townfolk;
const utils = require('../Utils.js'); 
const Soldier = require("./Soldier.js").Soldier;
const Alien = require("./Alien.js").Alien


const townfolks = [];
const aliens = [];
const soldiers = [];

function generateCharacters(charType){
	var populationSize = 0;
	var charArray = [];
	var charClass;
	switch(charType){
		case utils.CHARACTER_TYPE[0]:
			populationSize = utils.TOWNFOLKS_NUM;
			charArray = townfolks;
			charClass = Townfolk;
			break;
		case utils.CHARACTER_TYPE[1]:
			populationSize = utils.ALIENS_NUM;
			charArray = aliens;
			charClass = Alien;
			break;
		case utils.CHARACTER_TYPE[2]:
			populationSize = utils.SOLIDERS_NUM;
			charArray = soldiers;
			charClass = Soldier;
			break;
	}


	for (let i = 0; i < populationSize; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		charArray[i] = new charClass(randomName, pos);
		TownMap.getInstance().updateObjectOnTheMap(charArray[i], [], pos);
	}
}

function generateAllCharacters(){
	generateCharacters(utils.CHARACTER_TYPE[0]);
	generateCharacters(utils.CHARACTER_TYPE[1]);
	generateCharacters(utils.CHARACTER_TYPE[2]);
}

function wander(characterArray){
	for (let i = 0; i < characterArray.length; i++) {
		const oldPosition = JSON.parse(JSON.stringify(characterArray[i].position));
		// console.log("type " + characterArray[i].charType);
		characterArray[i].walkWithRandomDirection();
		TownMap.getInstance().updateObjectOnTheMap(characterArray[i], oldPosition, characterArray[i].position);
		// console.log("position!!! " + oldPosition + townfolks[i].position);
		console.log(characterArray[i].name + " (" + characterArray[i].charType + ") " + " move from " + oldPosition + " to " + characterArray[i].position);
	}
	checkEvents()
}

function charactersWander(){
	wander(townfolks);
	wander(aliens);
	wander(soldiers);
}

function checkEvents() {
	for (let i = 0; i < utils.MAP_SIZE[0]; i++) {
		for (let j = 0; j < utils.MAP_SIZE[1]; j++){
			if (TownMap.getInstance().map[i][j].length > 1) {
				handleEvents(TownMap.getInstance().map[i][j])
			}
		}
	}
}

function handleEvents(charArray){
	for (let i = 0; i < charArray.length; i++){
		for (let j = 0; j < charArray.length; j++){
			if (charArray[i] !== charArray[j]) {
				charArray[i].speak(charArray[j]);
				if (charArray[i].charType == utils.CHARACTER_TYPE[1] & charArray[j].charType != utils.CHARACTER_TYPE[1]){
					charArray[i].attack(charArray[j]);
				}
				if (charArray[i].charType == utils.CHARACTER_TYPE[2] & charArray[j].charType == utils.CHARACTER_TYPE[1]){
					charArray[i].attack(charArray[j]);
				}
			}
		}
	}
}

////////////////////
// temp test
function generateTempChar(){
	var charArray = []
	for (let i = 0; i < 2; i++) {
		var pos = TempMap.getInstance().generateRandomPos();
		var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		charArray[i] = new Townfolk(randomName, pos);
	}
	return charArray
}

function charTempWander(charArray){
	var directions = ['left', 'right']
	for (let i = 0; i < charArray.length; i++) {
		var tempDirection = directions[Math.floor(Math.random() * directions.length)]
		charArray[i].tempWalk(tempDirection)
		console.log(charArray[i].name + ' goes to ' + charArray[i].position)
	}

	for (let i = 0; i < charArray.length; i++) {
		for (let j = 0; j < charArray.length; j++) {

		}
	}
}

/////////////////////

module.exports = {
	generateAllCharacters,
	townfolks,
	charactersWander,
	generateTempChar,
	charTempWander,
}