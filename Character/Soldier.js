
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger
// const Mission = require('./CharacterState.js').Mission
const CharacterState = require('./CharacterState.js').CharacterState

var Soldier = function(name, position){
	// jssim.SimEvent.call(this, 20)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE[2]
	this.speed = 1
	this.visualRange = 5
	this.attackRange = 1
	this.state = new CharacterState()
	var soldierThis = this

	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = function(deltaTime){

		// if character died
		if (soldierThis.state == Utils.CHARACTER_STATES.DIED) { return }

		soldierThis.wander(this.time)
		// console.log(this.charName + ' goes to ' + this.position)

		if (CharactersData.charactersArray.length > 0) {
			for (let i = 0; i< CharactersData.charactersArray.length; i++){
				var character = CharactersData.charactersArray[i]
				if (soldierThis != character && soldierThis.position[0] == character.position[0] && soldierThis.position[1] == character.position[1]){
						
						var msgContent 
						switch (character.charType){
							case Utils.CHARACTER_TYPE[0]:
								// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' +character.charType + ')')
								msgContent = {
									N1: soldierThis.charName,
									// "character_type": soldierThis.charType,
									// "act": "greet",
									L: "said hello to",
									N2: character.charName,
									// "character2_type": character.charType,
									T:this.time,
								}
								break
							case Utils.CHARACTER_TYPE[1]:
								// console.log(this.charName + '(' + this.charType + ') attacked ' + character.charName + '(' + character.charType +')')
								msgContent = {
									N1: soldierThis.charName,
									// "character_type": soldierThis.charType,
									// "action": "attack",
									L: "attacked",
									N2: character.charName,
									// "character2_type": character.charType,
									T:this.time,
								}
								break
							case Utils.CHARACTER_TYPE[2]:
								// console.log(this.charName  + '(' + this.charType + ') said hello to ' + character.charName+ '(' + character.charType +')')
								msgContent = {
									N1: soldierThis.charName,
									// "character_type": soldierThis.charType,
									// "act": "greet",
									L: "said hello to",
									N2: character.charName,
									// "character2_type": character.charType,
									T:this.time,
								}
								break
						}
						
						this.sendMsg(character.simEvent.guid(), {
							content: JSON.stringify(msgContent)
						})
				}
			}
		}

		var messages = this.readInBox();
		for(var i = 0; i < messages.length; ++i){
			var msg = messages[i];
			var sender_id = msg.sender;
			var recipient_id = msg.recipient; // should equal to this.guid()
			var time = msg.time;


			var rank = msg.rank; // the messages[0] contains the highest ranked message and last messages contains lowest ranked
			var content = msg.content; // for example the "Hello" text from the sendMsg code above
			if (recipient_id == this.guid()){
				// console.log("content: " + content)
				// fs.appendFile('../Log.txt', content, (err) => { 
				// 	// In case of a error throw err. 
				// 	if (err) throw err; 
				// }) 
				// Utils.logger.debug(content)
				Logger.info(content)
			}
		}
	}
}

Soldier.prototype.tempWalk = function(direction){
	switch(direction){
		case 'left':
			this.position = this.position - 1 < 0 ? this.position : this.position - 1
			break;
		case 'right':
			this.position = this.position + 1 >= 10 ? this.position : this.position + 1
			break
	}
}

// step length == 1
Soldier.prototype.wander = function(time){
	var directions = ['left', 'right', 'up', 'down']
	var direction = directions[Math.floor(Math.random() * directions.length)]

	switch(direction){
		case 'left':
			this.position[0] = this.position[0] - this.speed < 0 ? 0 : this.position[0] - this.speed
			break;
		case 'right':
			this.position[0] = this.position[0] + this.speed >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + this.speed
			break
		case 'up':
			this.position[1] = this.position[1] - this.speed < 0 ? 0 : this.position[1] - this.speed
			break
		case 'down':
			this.position[1] = this.position[1] + this.speed >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + this.speed
			break
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		A: "m",
		P: this.position,
		T: time
	}))
}
module.exports = {
	Soldier,
}