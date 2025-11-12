// const TownMap = require("../Map/TownMap").TownMap;
const TownMap = require('../Map/TempMap.js').TempMap
const Townfolk = require('./Townfolk').Townfolk;
const utils = require('../Utils.js'); 
const Soldier = require("./Soldier.js").Soldier;
const Alien = require("./Alien.js").Alien
const Scheduler = require('../Scheduler.js')
const CharactersData = require('./CharactersData.js')
const Logger = require('../Logger.js').Logger

// const Test = require('./Test.js')


function generateAllCharacters(){
	for (let i = 0; i < utils.TOWNFOLKS_NUM; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		// var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var townfolkName = "t" + (i + 1)
		var townfolk = new Townfolk(townfolkName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(townfolk.simEvent, 1)
		CharactersData.charactersArray.push(townfolk)
	}
	for (let i = 0; i < utils.SOLIDERS_NUM; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		// var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var soldierName = "s" + (i + 1)
		var soldier = new Soldier(soldierName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(soldier.simEvent, 1)
		CharactersData.charactersArray.push(soldier)
	}
	for (let i = 0; i < utils.ALIENS_NUM; i++) {
		var pos = TownMap.getInstance().generateRandomPos();
		// var randomName = utils.TOWNFOLK_NAMES[Math.floor(Math.random() * utils.TOWNFOLK_NAMES.length)];
		var alienName = "a" + (i + 1)
		var alien = new Alien(alienName, pos);
		Scheduler.scheduler.scheduleRepeatingIn(alien.simEvent, 1)
		CharactersData.charactersArray.push(alien)
	}
}


module.exports = {
	generateAllCharacters,
	// townfolks,
	// charactersWander,
	// generateTempChar,
}