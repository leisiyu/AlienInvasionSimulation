
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
const { Alien } = require('./Alien.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger
const Map = require('../Map/TempMap.js').TempMap
const CharacterState = require('./CharacterState.js').CharacterState


var Townfolk = function(name, position){
	var townfolkThis = this
	// jssim.SimEvent.call(this, 10)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE[0]
	this.speed = 1
	this.visualRange = 3
	this.attackRange = 1
	this.state = new CharacterState()
	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = async function(deltaTime){
		
		// if character died
		if (townfolkThis.state == Utils.CHARACTER_STATES.DIED) { return }

		// check the character's state
		switch(townfolkThis.state.stateType){
			case Utils.CHARACTER_STATES.HIDE:
				// townfolkThis.wander(this.time)
				break
			case Utils.CHARACTER_STATES.PATROL:
				break
			case Utils.CHARACTER_STATES.CHASE:
				break
			case Utils.CHARACTER_STATES.REVENGE:
				break
			case Utils.CHARACTER_STATES.BUY:
				break
			case Utils.CHARACTER_STATES.DESTROY:
				break
			case Utils.CHARACTER_STATES.RUN_AWAY:
				townfolkThis.runAway(this.time)
				break
		}

		// townfolkThis.wander()
		if (CharactersData.charactersArray.length > 1){
			for(let i = 0; i < CharactersData.charactersArray.length; i++){
				var character = CharactersData.charactersArray[i]
				// Logger.info("name " + townfolkThis.charName + " " + townfolkThis.position + ' '+ character.charName + " " + character.position)
				if (townfolkThis != character && townfolkThis.position[0] == character.position[0] && townfolkThis.position[1] == character.position[1]){
					var msgContent 
					switch (character.charType){
						case Utils.CHARACTER_TYPE[0]:
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
							msgContent = {
								"character_name": townfolkThis.charName,
								// "character_type": townfolkThis.charType,
								// "act": "greeting",
								"log": "said hello to",
								"character2_name": character.charName,
								// "character2_type": character.charType,
								"time":this.time,
							}
							break
						case Utils.CHARACTER_TYPE[1]:
							// console.log(this.charName + '(' + this.charType + ') meet ' + character.charName + '(' + character.charType +')' + ' and then tried to run away')
							msgContent = {
								N1: townfolkThis.charName,
								// "character_type": townfolkThis.charType,
								// "act": "run away",
								L: "met and then tried to run away from",
								N2: character.charName,
								// "character2_type": character.charType,
								T:this.time,
							}
							break
						case Utils.CHARACTER_TYPE[2]:
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
							msgContent = {
								N1: townfolkThis.charName,
								// "character_type": townfolkThis.charType,
								// "act": "greeting",
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
				// Logger.info(content)
				var messageContent = JSON.parse(content)
				switch (messageContent.action) {
					case Utils.CHARACTER_STATES.CHASE:
						// townfolkThis.runAway(messageContent)
						var character = CharactersData.getCharacterByName(messageContent.Character2Name)
						if (character) {
							townfolkThis.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, {Character: character})
						}
						break
					//// TO DO: finish all the other cases
				}
			}
		}
	}
}

Townfolk.prototype.runAway = function(time){
	Logger.info(JSON.stringify({
		N1: this.charName,
		L: " ran away from ",
		N2: content.CharacterName,
		T: this.time,
	}))

	console.info(this.charName + " tried to run away from " + this.state.target.character.charName)
	for(let i = 0; i < this.speed; i++){
		this.runawaySingleMove(time)
	}
}


// one unit per time
// if at border.....
Townfolk.prototype.runawaySingleMove = function(time){

	randomDirection = Math.floor(Math.random() * 2)
	var result = this.runAwayOneDirection(randomDirection, time)
	if (!result) {
		// if the first direction doesn't work
		// try the other direction
		// if can not move too, then randomly choose a direction and run
		var result2 = this.runAwayOneDirection(randomDirection % 1, time)
		if (!result2){
			var randomDirection2 = Math.floor(Math.random() * 2)
			if (this.position[randomDirection2] - 1 >= 0) {
				this.position[randomDirection2] = this.position[randomDirection2] - 1
				Logger.statesInfo(JSON.stringify({
					N: this.name,
					A: "moved to", 
					P: this.position,
					T: time,
				}))
			} else if (this.position[randomDirection2] + 1 < Utils.MAP_SIZE[randomDirection2]){
				this.position[randomDirection2] = this.position[randomDirection2] + 1
				Logger.statesInfo(JSON.stringify({
					N: this.name,
					A: "moved to", 
					P: this.position,
					T: time,
				}))
			}
		}
	}
}

Townfolk.prototype.runAwayOneDirection = function(direction, time){
	var enemyPosition = this.state.target.character.position
	
	if (enemyPosition[direction] > this.position[direction]) {
		if (this.position[direction] - 1 >= 0) {
			this.position[direction] = this.position[direction] - 1
			Logger.statesInfo(JSON.stringify({
				N: this.name,
				A: "moved to", 
				P: this.position,
				T: time,
			}))
			return true
		} else {
			return false
		}
	} else if (enemyPosition[direction] < this.position[randomDirection]) {
		if (this.position[direction] + 1 < Utils.MAP_SIZE[direction]) {
			this.position[direction] = this.position[direction] + 1
			Logger.statesInfo(JSON.stringify({
				N: this.name,
				A: "moved to", 
				P: this.position,
				T: time,
			}))
			return true
		} else {
			return false
		}
	} else {
		if (this.position[direction] - 1 >= 0) {
			this.position[direction] = this.position[direction] - 1
			Logger.statesInfo(JSON.stringify({
				N: this.name,
				A: "moved to", 
				P: this.position,
				T: time,
			}))
			return true
		} else if (this.position[direction] + 1 < Utils.MAP_SIZE[direction]) {
			this.position[direction] = this.position[direction] + 1
			Logger.statesInfo(JSON.stringify({
				N: this.name,
				A: "moved to", 
				P: this.position,
				T: time,
			}))
			return true
		} else {
			return false
		}
	}
}


Townfolk.prototype.wander = function(time){
	var directions = ['left', 'right', 'up', 'down']
	var direction = directions[Math.floor(Math.random() * directions.length)]

	var newPosition = [Number(JSON.stringify(this.position[0])), Number(JSON.stringify(this.position[1]))]
	switch(direction){
		case 'left':
			newPosition[0] = newPosition[0] - this.speed < 0 ? 0 : newPosition[0] - this.speed
			break;
		case 'right':
			newPosition[0] = newPosition[0] + this.speed >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : newPosition[0] + this.speed
			break
		case 'up':
			newPosition[1] = newPosition[1] - this.speed < 0 ? 0 : newPosition[1] - this.speed
			break
		case 'down':
			newPosition[1] = newPosition[1] + this.speed >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : newPosition[1] + this.speed
			break
	}


	/////check buildings
	// // check the new position
	// var isOldPositionInBuilding = Map.getInstance().checkIsInABuilding(this.position)
	// var isNewPositionInBuilding = Map.getInstance().checkIsInABuilding(newPosition)

	// // old and new positions are in different buildings
	// if (isOldPositionInBuilding[0] && isNewPositionInBuilding[0] && isOldPositionInBuilding[1] != isNewPositionInBuilding[1]){
	// 	var oldBuilding = Map.getInstance().getBuilding(isOldPositionInBuilding[1])
	// 	// check if accessible
	// 	if (!oldBuilding.checkPosAccessible(newPosition)) {
	// 		return 
	// 	}
	// }
	// // old is in a building; new is not in a building
	// if (isOldPositionInBuilding[0] && !isNewPositionInBuilding[0]) {
	// 	var oldBuilding = Map.getInstance().getBuilding(isOldPositionInBuilding[1])
	// 	// check if accessible
	// 	if (!oldBuilding.checkPosAccessible(newPosition)) {
	// 		return 
	// 	}
	// }
	// // old is not in a building; new is in a building
	// if (!isOldPositionInBuilding[0] && isNewPositionInBuilding[0]) {
	// 	var newBuilding = Map.getInstance().getBuilding(isNewPositionInBuilding[1])
	// 	// check if accessible
	// 	if (!newBuilding.checkPosAccessible(this.position)) {
	// 		return 
	// 	}
	// }

	//////////////
	//////log
	// if (isOldPositionInBuilding[0]) {
	// 	console.log(this.charName + " was in building " + isOldPositionInBuilding[1])
	// }
	// console.log(this.charName + "(" + isOldPositionInBuilding + ")" + " moved to " + newPosition)
	// if (isNewPositionInBuilding[0]) {
	// 	console.log(this.charName + "is in building " + isNewPositionInBuilding[1] + " now")
	// }
	/////////////
	
	this.position = newPosition

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		A: "m",
		P: this.position,
		T: time,
	}))
}

module.exports = {
	Townfolk,
}