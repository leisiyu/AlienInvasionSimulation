const TownMap = require("../Map/TownMap").TownMap;
// const TempMap = require('../Map/TempMap.js').TempMap
const Townfolk = require('./Townfolk').Townfolk;
const utils = require('../Utils.js'); 
const Soldier = require("./Soldier.js").Soldier;
const Alien = require("./Alien.js").Alien
const Scheduler = require('../Scheduler.js')
const CharactersData = require('./CharactersData.js')

// const Test = require('./Test.js')

////////////////////
// temp test
function generateTempChar(){
	for (let i = 0; i < 2; i++) {
		var pos = TempMap.getInstance().generateRandomPos();
		var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var tempCharacter = new Townfolk(randomName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(tempCharacter.simEvent, 5)
		CharactersData.charactersArray.push(tempCharacter)
	}

	for (let i = 0; i < 2; i++) {
		var pos = TempMap.getInstance().generateRandomPos();
		var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var tempCharacter = new Soldier(randomName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(tempCharacter.simEvent, 5)
		CharactersData.charactersArray.push(tempCharacter)
	}

	var pos = TempMap.getInstance().generateRandomPos();
	var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
	var tempCharacter = new Alien(randomName, pos);
	Scheduler.scheduler.scheduleRepeatingIn(tempCharacter.simEvent, 5)
	CharactersData.charactersArray.push(tempCharacter)
	
	// Scheduler.scheduler.scheduleRepeatingIn(Test.evt1, 10)
	// Scheduler.scheduler.scheduleRepeatingIn(Test.evt2, 10)
}

/////////////////////

function generateAllCharacters(){
	for (let i = 0; i < utils.TOWNFOLKS_NUM; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		// var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var townfolkName = "townfolk" + i
		var townfolk = new Townfolk(townfolkName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(townfolk.simEvent, 50)
		CharactersData.charactersArray.push(townfolk)
	}
	for (let i = 0; i < utils.SOLIDERS_NUM; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		// var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var soldierName = "Soldier" + i
		var soldier = new Soldier(soldierName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(soldier.simEvent, 5)
		CharactersData.charactersArray.push(soldier)
	}
	for (let i = 0; i < utils.ALIENS_NUM; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		// var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var alienName = "Alien" + i
		var alien = new Alien(alienName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(alien.simEvent, 5)
		CharactersData.charactersArray.push(alien)
	}
}

function removeOneCharacter(character){
	// remove registered event

	// remove from characters array
}

module.exports = {
	generateAllCharacters,
	// townfolks,
	// charactersWander,
	// generateTempChar,
}