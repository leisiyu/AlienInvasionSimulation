
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('fs')
const Logger = require('../Logger.js').Logger
const CharacterState = require('./CharacterState.js').CharacterState
const Probability = require('./Probability.js').Probability
const MapManager = require("../Map/MapManager.js")

var Alien = function(name, position){
	// jssim.SimEvent.call(this)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE.ALIEN
	var alienThis = this
	this.speed = 2
	this.visualRange = 6
	this.attackRange = 2
	this.maxHp = Math.floor(Math.random() * 300) + 200
	this.hp = this.maxHp
	this.attackValue = Math.floor(Math.random() * 30) + 10
	this.lastDirection = ""
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.state = new CharacterState()
	this.simEvent = new jssim.SimEvent(10)
	this.simEvent.update = function(deltaTime){

		// if character died
		if (alienThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }


		// if hurt, recover 1 every step
		if (alienThis.hp < alienThis.maxHp) {
			alienThis.hp ++
		}

		// check the character's state
		switch(alienThis.state.stateType){
			case Utils.CHARACTER_STATES.PATROL:
				if (alienThis.checkEnemiesAround(this.time)){
					if (alienThis.isBadlyHurt()) {
						alienThis.runAway(this.time)
					} else {
						alienThis.chasePeople(this.time)
					}
					
					break
				}
				alienThis.wander(this.time)
				break
			case Utils.CHARACTER_STATES.CHASE:
				if (!alienThis.checkEnemiesAround(this.time)){
					alienThis.wander(this.time)
					break
				} else if (alienThis.isBadlyHurt()){
					alienThis.runAway(this.time)
					break
				}
				alienThis.chasePeople(this.time)

				// reached attack range after chasing
				if (alienThis.state.stateType == Utils.CHARACTER_STATES.ATTACK){
					var isSuccessfulAttack = alienThis.attack(this.time)
					if (isSuccessfulAttack) {
						var msg = {
							msgType: "attacked",
							atkValue: alienThis.attackValue,
							attacker: alienThis.charName,
						}
						
						this.sendMsg(alienThis.state.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					}
					
				}
				break
			case Utils.CHARACTER_STATES.DESTROY:
				alienThis.destroy(this.time)
				break
			case Utils.CHARACTER_STATES.RUN_AWAY:
				alienThis.runAway(this.time)
				break
			case Utils.CHARACTER_STATES.ATTACK:		
				
				var isSuccessfulAttack = alienThis.attack(this.time)

				if (isSuccessfulAttack) {
					// notify the attacked character
					// state type maybe changed in the attack function
					// if (alienThis.state.stateType == Utils.CHARACTER_STATES.ATTACK){
						
						var msg = {
							msgType: "attacked",
							atkValue: alienThis.attackValue,
							attacker: alienThis.charName,
						}
						this.sendMsg(alienThis.state.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
				// }
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
				var msgContent = JSON.parse(content)

				if (msgContent.msgType.valueOf() == "attacked".valueOf()) {
					alienThis.hp = alienThis.hp - msgContent.atkValue
					if (alienThis.hp <= 0){
						alienThis.state.setState(Utils.CHARACTER_STATES.DIED, null)
						Logger.info(JSON.stringify({
							N1: alienThis.charName,
							L: "was killed by",
							N2: msgContent.attacker,
							T: this.time,
						}))
						Logger.statesInfo(JSON.stringify({
							N: alienThis.charName,
							S: alienThis.state.stateType,
							P: alienThis.position,
							T: this.time
						}))
					} else {
						alienThis.state.setState(Utils.CHARACTER_STATES.ATTACK, CharactersData.getCharacterByName(msgContent.attacker))
					}
				}

			}
		}

	}
}

Alien.prototype.isBadlyHurt = function(){
	return this.hp / this.maxHp <= 0.2
}

Alien.prototype.checkEnemiesAround = function(time){
	//// check the visual range
	//// if there's an enemy around, 
		////check self hp first
		////if healthy enough chase it 
		////else run away
	//// if already chasing someone, check if he's in the visual range
	//// else wander around
	var visibleCharacters = this.checkVisualRange()
	if (visibleCharacters.length > 0){
		if (this.isBadlyHurt()) {
			var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomVisibleCharacter)
			return true
		}
		if (this.state.stateType == Utils.CHARACTER_STATES.CHASE){
			if (!visibleCharacters.includes(this.state.target)){
				var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
				this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
			}
		} else {
			var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
			// this.chasePeople(time)
		}
		return true
	}

	this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	return false
}

Alien.prototype.wander = function(time){
	for (let i = 0; i < this.speed; i++) {
		this.moveOneStep()
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType,
		P: this.position,
		T: time
	}))
}

Alien.prototype.moveOneStep = function(){
	var availableDirections = this.getAvailableDirections()

	var direction
	if (this.lastDirection == "") {
		direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
	} else {
		var idx = availableDirections.indexOf(this.lastDirection)

		if (idx < 0) {
			direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
		} else {
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
	}

	this.lastDirection = direction

	switch(direction){
		case Utils.DIRECTION[0]:
			this.position[1] = this.position[1] - 1 < 0 ? 0 : this.position[1] - 1
			break
		case Utils.DIRECTION[1]:
			this.position[1] = this.position[1] + 1 >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + 1
			break
		case Utils.DIRECTION[2]:
			this.position[0] = this.position[0] - 1 < 0 ? 0 : this.position[0] - 1
			break;
		case Utils.DIRECTION[3]:
			this.position[0] = this.position[0] + 1 >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + 1
			break
	}
}

Alien.prototype.getAvailableDirections = function(){
	var availableDirections = []
	for (let i = 0; i < Utils.DIRECTION.length; i++) {
		var tempDir = Utils.DIRECTION[i]
		var tempPos = JSON.parse(JSON.stringify(this.position))
		switch (tempDir) {
			case Utils.DIRECTION[0]:
				tempPos[1]--
				break
			case Utils.DIRECTION[1]:
				tempPos[1]++
				break
			case Utils.DIRECTION[2]:
				tempPos[0]--
				break
			case Utils.DIRECTION[3]:
				tempPos[0]++
				break
		}
		if (tempPos[0] >=0 && tempPos[0] < Utils.MAP_SIZE[0] 
			&& tempPos[1] >=0 && tempPos[1] < Utils.MAP_SIZE[1]) {

			var isInBuilding = MapManager.getMap().checkIsInABuilding(tempPos)
			if (isInBuilding[0]) {
				var building = MapManager.getMap().getBuilding(isInBuilding[1])
				if (building.isAccessibleTo(Utils.CHARACTER_TYPE.ALIEN)) {
					availableDirections.push(tempDir)
				}
			} else {
				availableDirections.push(tempDir)
			}
		}
	}

	return availableDirections
}

Alien.prototype.destroy = function(time){}

Alien.prototype.chasePeople = function(time){
	
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
		var characterName = this.state.target.charName
		this.state.setState(Utils.CHARACTER_STATES.ATTACK, CharactersData.getCharacterByName(characterName))
	}
}

// attacked -> died
Alien.prototype.attack = function(time){
	// check if the character died
	if (this.state.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		Logger.info(JSON.stringify({
			N1: this.charName,
			L: "killed",
			N2: this.state.target.charName,
			T: time,
		}))
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		this.wander(time)
		return false
	}		

	// check self hp
	if (this.isBadlyHurt()){
		this.state.updateState(Utils.CHARACTER_STATES.RUN_AWAY)
		this.runAway(time)
		return false
	}

	// check attack range
	var character = this.state.target
	var distance = Math.abs(this.position[0] - character.position[0]) + Math.abs(this.position[1] - character.position[1])
	if (distance > this.attackRange) {
		// this frame still need to move
		if (distance > this.visualRange) {
			this.setState(Utils.CHARACTER_STATES.PATROL, null)
			this.wander(time)
		} else {
			this.state.setState(Utils.CHARACTER_STATES.CHASE, character)
			this.chasePeople(time)
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

Alien.prototype.runAway = function(time){
	Logger.info(JSON.stringify({
		N1: this.charName,
		L: "is Badly hurt, ran away from ",
		N2: this.state.target.charName,
		T: time,
	}))

	var oppositDir = this.getRunAwayDirection()
	var randomIdx = Math.floor(Math.random() * oppositDir.length)
	var randomDirection = oppositDir[randomIdx]
	switch(randomDirection){
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
		T: time,
	}))
	
	if (!this.isBadlyHurt()) {
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	}
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
			&& character.state.stateType != Utils.CHARACTER_STATES.DIED) {
				visibleCharacters.push(character)
				// console.log(this.charName + " saw " + character.charName)
			}
	}
	
	return visibleCharacters
}

Alien.prototype.getRunAwayDirection = function(){
	var oppositDir = []
	if (this.position[0] - this.state.target.position[0] > 0) {
		oppositDir.push(Utils.DIRECTION[3])
	} else if (this.position[0] - this.state.target.position[0] < 0) {
		oppositDir.push(Utils.DIRECTION[2])
	} else {
		oppositDir.push(Utils.DIRECTION[2])
		oppositDir.push(Utils.DIRECTION[3])
	}

	if (this.position[1] - this.state.target.position[1] > 0) {
		oppositDir.push(Utils.DIRECTION[1])
	} else if (this.position[1] - this.state.target.position[0] < 1) {
		oppositDir.push(Utils.DIRECTION[0])
	} else {
		oppositDir.push(Utils.DIRECTION[0])
		oppositDir.push(Utils.DIRECTION[1])
	}

	return oppositDir
}

module.exports = {
	Alien,
}