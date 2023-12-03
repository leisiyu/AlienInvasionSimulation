const TownMap = require("../Map/TownMap").TownMap;
const TempMap = require('../Map/TempMap.js').TempMap
const Townfolk = require('./Townfolk').Townfolk;
const utils = require('../Utils.js'); 
const Soldier = require("./Soldier.js").Soldier;
const Alien = require("./Alien.js").Alien
const Scheduler = require('../Scheduler.js')
const CharactersData = require('./CharactersData.js')

const Test = require('./Test.js')

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

module.exports = {
	generateAllCharacters,
	townfolks,
	charactersWander,
	generateTempChar,
}