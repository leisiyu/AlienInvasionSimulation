
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('fs')
const Logger = require('../Logger.js').Logger
const Mission = require('./Mission.js').Mission

var Alien = function(name, position){
	// jssim.SimEvent.call(this)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE[1]
	var alienThis = this
	this.speed = 1
	this.visualRange = 6
	this.attackRange = 3
	this.status = Utils.CHARACTER_STATUS.NORMAL
	this.mission = new Mission()
	this.simEvent = new jssim.SimEvent(10)
	this.simEvent.update = function(deltaTime){

		// if character died
		if (alienThis.status == Utils.CHARACTER_STATUS.DIED) { return }

		// check if the character has a mission
		switch(alienThis.mission.missionType){
			case Utils.CHARACTER_MISSION.NONE:
				alienThis.wander()
				break
			case Utils.CHARACTER_MISSION.CHASE:
				var msgContent = {
					CharacterName: alienThis.charName,
					Action: Utils.CHARACTER_MISSION.CHASE,
					Character2Name: alienThis.mission.target.character.charName,
					Time: this.time,
				}
				this.sendMsg(alienThis.mission.target.character.simEvent.guid(), {
					content: JSON.stringify(msgContent)
				})
				alienThis.chasePeople(this.time)
				break
			case Utils.CHARACTER_MISSION.REVENGE:
				break
			case Utils.CHARACTER_MISSION.BUY:
				break
			case Utils.CHARACTER_MISSION.DESTROY:
				break
			case Utils.CHARACTER_MISSION.RUN_AWAY:
				break
			case Utils.CHARACTER_MISSION.FIGHT_BACK:
				break
		}
		

		// encounter someone
		if (CharactersData.charactersArray.length > 0) {
			for (let i = 0; i< CharactersData.charactersArray.length; i++){
				var character = CharactersData.charactersArray[i]
				if (alienThis != character && alienThis.position[0] == character.position[0] && alienThis.position[1] == character.position[1]){
						
						var msgContent
						if (alienThis.charType != character.charType){
							// console.log(this.charName + '(' + this.charType + ') attacked ' + character.charName + '(' +character.charType + ')')
							msgContent = {
								"character_name": alienThis.charName,
								// "character_type": alienThis.charType,
								// "action": "attack",
								"log": "attacked",
								"character2_name": character.charName,
								// "character2_type": character.charType,
								"time":this.time,
							}
						} else {
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' +character.charType + ')')
							msgContent = {
								"character_name": alienThis.charName,
								// "character_type": alienThis.charType,
								// "act": "greet",
								"log": "said hello to",
								"character2_name": character.charName,
								// "character2_type": character.charType,
								"time":this.time,
							}
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
					// In case of a error throw err. 
					// if (err) throw err;
					// else {
					// 	console.log('successful')
					// }
				// }) 
					// Utils.logger.debug(content)
				Logger.info(content)
			}
		}

	}
}


Alien.prototype.wander = function(){
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
		Name: this.charName,
		Action: "moved to",
		Position: this.position,
	}))

	if (this.mission.missionType == Utils.CHARACTER_MISSION.NONE) {
		var visibleCharacters = this.checkVisualRange()
		if (visibleCharacters.length > 0){
			var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
			this.mission.setMission(Utils.CHARACTER_MISSION.CHASE, {character: randomVisibleCharacter})
		}
	}
}

Alien.prototype.chasePeople = function(time){
	for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		if (character.charName == this.mission.target.character.charName) {
			console.log(this.charName + " was chasing " + character.charName)
			Logger.info(JSON.stringify({
				CharacterName: this.charName,
				log: "was chasing",
				Character2Name: character.charName,
				Time: time,
			}))
			var position = character.position
			for (let j = 0; j < this.speed; j++){
				if (position[0] != this.position[0] && position[1] != this.position[1]) {
					var randomDir = Math.floor(Math.random() * 2)
					this.position[randomDir] = this.position[randomDir] > position[randomDir] ? this.position[randomDir] - 1 : this.position[randomDir] + 1
				} else if (position[0] != this.position[0]) {
					this.position[0] = this.position[0] > position[0] ? this.position[0] - 1 : this.position[0] + 1
				} else if (position[1] != this.position[1]) {
					this.position[1] = this.position[1] > position[1] ? this.position[1] - 1 : this.position[1] + 1
				} else {
					break
				}
			}

			Logger.statesInfo(JSON.stringify({
				Name: this.charName,
				Action: "moved to", 
				Position: this.position,
			}))

			if (Math.abs(this.position[0] - position[0]) + Math.abs(this.position[1] - position[1]) <= this.attackRange) {
				this.attack(character, time)
			}
			break
		}
	}
}

// attack -> died
Alien.prototype.attack = function(character, time){
	character.status = Utils.CHARACTER_STATUS.DIED
	console.log(character.charName + " DIED! ")
	console.log(this.charName + " mission updated to " + Utils.CHARACTER_MISSION.NONE)
	Logger.info(JSON.stringify({
		CharacterName: character.charName,
		Log: "was killed by",
		Character2Name: this.charName,
		Time: time,
	}))
	this.mission.setMission(Utils.CHARACTER_MISSION.NORMAL, {})
}

Alien.prototype.checkVisualRange = function(){
	var startX = this.position[0] - this.visualRange < 0 ? 0 : this.position[0] - this.visualRange
	var endX = this.position[0] + this.visualRange >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + this.visualRange
	var startY = this.position[1] - this.visualRange < 0 ? 0 : this.position[1] - this.visualRange
	var endY = this.position[1] + this.visualRange >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + this.visualRange

	var visibleCharacters = []
	for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		var characterPos = character.position
		if (characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.charType != this.charType
			&& character.status != Utils.CHARACTER_STATUS.DIED) {
				visibleCharacters.push(character)
				// console.log(this.charName + " saw " + character.charName)
			}
	}
	
	return visibleCharacters
}


module.exports = {
	Alien,
}