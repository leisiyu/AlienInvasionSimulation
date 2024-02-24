
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger
// const Mission = require('./CharacterState.js').Mission
const CharacterState = require('./CharacterState.js').CharacterState
const Probability = require('./Probability.js').Probability

var Soldier = function(name, position){
	// jssim.SimEvent.call(this, 20)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE.SOLDIER
	this.speed = 1
	this.visualRange = 5
	this.attackRange = 1
	this.maxHp = 150
	this.hp = 150
	this.attackValue = 60
	this.state = new CharacterState()
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.lastDirection = ""
	var soldierThis = this

	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = function(deltaTime){

		// if character died
		if (soldierThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }

		// check the character's state
		switch(soldierThis.state.stateType){
			case Utils.CHARACTER_STATES.HIDE:
				break
			case Utils.CHARACTER_STATES.PATROL:
				// check visual range first
				if (soldierThis.checkEnemiesAround(this.time)) {
					soldierThis.chase(this.time)
					break
				}
				soldierThis.wander(this.time)
				break
			case Utils.CHARACTER_STATES.CHASE:
				if (!soldierThis.checkEnemiesAround(this.time)) {
					soldierThis.wander(time)
					break
				}

				soldierThis.chase(this.time)

				// reached attack range after chasing
				if(soldierThis.state.stateType == Utils.CHARACTER_STATES.ATTACK){
					Logger.info(JSON.stringify({
						N1: soldierThis.charName,
						L: "attacked",
						N2: soldierThis.state.target.charName,
						T: this.time,
					}))
					var msg = {
						msgType: "attacked",
						atkValue: soldierThis.attackValue,
						attacker: soldierThis.charName,
					}
					this.sendMsg(soldierThis.state.target.simEvent.guid(), {
						content: JSON.stringify(msg)
					})
				}
				break
			case Utils.CHARACTER_STATES.RUN_AWAY:
				// check visual range first
				// if (!soldierThis.checkEnemiesAround(this.time)) {
				// 	soldierThis.wander(this.time)
				// 	break
				// }
				// soldierThis.runAway(this.time)
				break
			case Utils.CHARACTER_STATES.ATTACK:
				var isSuccessfulAttack = soldierThis.attack(this.time)

				if (isSuccessfulAttack) {
					// notify the attacked character
					// state type maybe changed in the attack function
					if (soldierThis.state.stateType == Utils.CHARACTER_STATES.ATTACK){
						var msg = {
							msgType: "attacked",
							atkValue: soldierThis.attackValue,
							attacker: soldierThis.charName,
						}
						this.sendMsg(soldierThis.state.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
				}
				}
				break
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
				var messageContent = JSON.parse(content)
				if (messageContent.msgType.valueOf() == "attacked".valueOf()) {
					soldierThis.hp = soldierThis.hp - messageContent.atkValue
					if (soldierThis.hp <= 0) {
						soldierThis.state.setState(Utils.CHARACTER_STATES.DIED, null)
						Logger.info(JSON.stringify({
							N1: soldierThis.charName,
							L: "was killed by",
							N2: messageContent.attacker,
							T: this.time,
						}))
						Logger.statesInfo(JSON.stringify({
							N: soldierThis.charName,
							S: soldierThis.state.stateType,
							P: soldierThis.position,
							T: this.time
						}))
					} else {
						soldierThis.state.setState(Utils.CHARACTER_STATES.CHASE, CharactersData.getCharacterByName(messageContent.attacker))
					}

				}
			}
		}
	}
}

// step length == 1
Soldier.prototype.wander = function(time){
	var direction 
	if (this.lastDirection == "") {
		direction = Utils.DIRECTION[Math.floor(Math.random() * Utils.DIRECTION.length)]
	} else {
		var idx = Utils.DIRECTION.indexOf(this.lastDirection)
		var newWeights = []
		for (let i = 0; i < Utils.DIRECTION.length; i++) {
			if (i == idx) {
				newWeights.push(30)
			} else (
				newWeights.push(10)
			)
		}
		this.directionProbability.updateWeights(newWeights)
		direction = this.directionProbability.randomlyPick()
	}
	this.lastDirection = direction

	switch(direction){
		case Utils.DIRECTION[0]:
			this.position[1] = this.position[1] - this.speed < 0 ? 0 : this.position[1] - this.speed
			break
		case Utils.DIRECTION[1]:
			this.position[1] = this.position[1] + this.speed >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + this.speed
			break
		case Utils.DIRECTION[2]:
			this.position[0] = this.position[0] - this.speed < 0 ? 0 : this.position[0] - this.speed
			break;
		case Utils.DIRECTION[3]:
			this.position[0] = this.position[0] + this.speed >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + this.speed
			break
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType,
		P: this.position,
		T: time
	}))
}

Soldier.prototype.chase = function(time){
	Logger.info(JSON.stringify({
		N1: this.charName,
		L: "was chasing",
		N2: this.state.target.charName,
		T: time,
	}))
	var position = this.state.target.position
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
		N: this.charName,
		S: this.state.stateType, 
		P: this.position,
		T: time,
	}))

	if (Math.abs(this.position[0] - position[0]) + Math.abs(this.position[1] - position[1]) <= this.attackRange) {
		var character = this.state.target
		this.state.setState(Utils.CHARACTER_STATES.ATTACK, character)
	}
}

Soldier.prototype.attack = function(time){
	// check if the character died
	if (this.state.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		this.wander(time)
		return false
	}		

	// check attack range
	var character = this.state.target
	var distance = Math.abs(this.position[0] - character.position[0]) + Math.abs(this.position[1] - character.position[1])
	if (distance > this.attackRange) {
		// this frame still need to move
		if (distance > this.visualRange) {
			this.setState(Utils.CHARACTER_STATES.PATROL, nil)
			this.wander(time)
		} else {
			this.state.setState(Utils.CHARACTER_STATES.CHASE, character)
			this.chase(time)
		}
		return false
	}

	Logger.info(JSON.stringify({
		N1: this.charName,
		L: "attacked",
		N2: character.charName,
		T: time,
	}))
	return true
}

Soldier.prototype.checkEnemiesAround = function(){
	//// check the visual range
	//// if there's an enemy around, chase him first
	//// if already chasing someone, check if he's in the visual range
	//// else wander around
	var visibleCharacters = this.checkVisualRange()
	if (visibleCharacters.length > 0){
		if (this.state.stateType == Utils.CHARACTER_STATES.CHASE){
			if (!visibleCharacters.includes(this.state.target)){
				var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
				this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
			}
		} else {
			var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
		}
		return true
	}

	this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	return false
}

Soldier.prototype.checkVisualRange = function(){
	var startX = this.position[0] - this.visualRange < 0 ? 0 : this.position[0] - this.visualRange
	var endX = this.position[0] + this.visualRange >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + this.visualRange
	var startY = this.position[1] - this.visualRange < 0 ? 0 : this.position[1] - this.visualRange
	var endY = this.position[1] + this.visualRange >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + this.visualRange

	var visibleEnemies = []
	for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		var characterPos = character.position
		if (characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.charType == Utils.CHARACTER_TYPE.ALIEN
			&& character.state.stateType != Utils.CHARACTER_STATES.DIED) {
				visibleEnemies.push(character)
			}
	}
	
	return visibleEnemies
}
module.exports = {
	Soldier,
}