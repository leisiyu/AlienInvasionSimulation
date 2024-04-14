
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger
// const Mission = require('./CharacterState.js').Mission
const CharacterState = require('./CharacterState.js').CharacterState
const Probability = require('./Probability.js').Probability
const MapManager = require("../Map/MapManager.js")

var Soldier = function(name, position){
	// jssim.SimEvent.call(this, 20)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE.SOLDIER
	this.speed = Math.floor(Math.random() * 3) + 1
	this.visualRange = 5
	this.attackRange = 1
	this.maxHp = Math.floor(Math.random() * 300) + 200
	this.hp = this.maxHp
	this.attackValue = Math.floor(Math.random() * 30) + 10
	this.state = new CharacterState()
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.lastDirection = ""
	var soldierThis = this

	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = function(deltaTime){

		// if character died
		if (soldierThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }

		// self healing
		if (soldierThis.hp < soldierThis.maxHp) {
			soldierThis.hp ++
		}

		// check the character's state
		switch(soldierThis.state.stateType){
			case Utils.CHARACTER_STATES.HIDE:
				break
			case Utils.CHARACTER_STATES.PATROL:
				// check visual range first
				if (soldierThis.checkEnemiesAround(this.time)) {
					if (soldierThis.isBadlyHurt()) {
						soldierThis.runAway(this.time)
					} else {
						soldierThis.chase(this.time)
					}
					
					break
				}
				soldierThis.wander(this.time)
				break
			case Utils.CHARACTER_STATES.CHASE:
				if (!soldierThis.checkEnemiesAround(this.time)) {
					soldierThis.wander(time)
					break
				} else {
					if (soldierThis.isBadlyHurt()){
						soldierThis.runAway(time)
						break
					}
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
				if (!soldierThis.checkEnemiesAround(this.time)) {
					soldierThis.wander(this.time)
					break
				} else {
					if (!soldierThis.isBadlyHurt()) {
						soldierThis.chase(this.time)
					}
				}
				soldierThis.runAway(this.time)
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
						if (soldierThis.isBadlyHurt()){
							Logger.info(JSON.stringify({
								N1: soldierThis.charName,
								L: "was badly hurt, ran away from",
								N2: messageContent.attacker,
								T: time,
							}))
							soldierThis.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(messageContent.attacker))
						} else {
							Logger.info(JSON.stringify({
								N1: soldierThis.charName,
								L: "was attacked, and fighted back",
								N2: messageContent.attacker,
								T: time,
							}))
							soldierThis.state.setState(Utils.CHARACTER_STATES.CHASE, CharactersData.getCharacterByName(messageContent.attacker))
						}
						
					}

				}
			}
		}
	}
}

// step length == 1
Soldier.prototype.wander = function(time){
	for (let i = 0; i < this.speed; i++) {
		var availableDirections = this.getAvailableDirections()
		this.moveOneStep(availableDirections)
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType,
		P: this.position,
		T: time
	}))
}

Soldier.prototype.moveOneStep = function(availableDirections){
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

Soldier.prototype.getAvailableDirections = function(){
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

Soldier.prototype.runAway = function(time){
	Logger.info(JSON.stringify({
		N1: this.charName,
		L: "ran away from",
		N2: this.state.target.charName,
		T: time,
	}))

	for (let i = 0; i < this.speed; i++){
		var oppositDir = this.getRunAwayDirection()
		this.moveOneStep(oppositDir)
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType, 
		P: this.position,
		T: time,
	}))
	
	if (!this.isBadlyHurt()) {
		var enemies = this.checkVisualRange()
		if (enemies.length <= 0) {
			Logger.info(JSON.stringify({
				N1: this.charName,
				L: "recovered, and started to partrol",
				N2: "",
				T: time,
			}))
			this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		} else {
			randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
			Logger.info(JSON.stringify({
				N1: this.charName,
				L: "recovered, and started to chase",
				N2: randomEnemy.charName,
				T: time,
			}))
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomEnemy)
		}
		
	}

	// run away succeed
	if (this.checkVisualRange().length <= 0) {
		Logger.info(JSON.stringify({
			N1: this.charName,
			L: "successfully ran away from",
			N2: this.state.target.charName,
			T: time,
		}))
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	}
}

Soldier.prototype.isBadlyHurt = function(){
	return this.hp / this.maxHp <= 0.2
}

Soldier.prototype.getRunAwayDirection = function(){
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
			Logger.info(JSON.stringify({
				N1: this.charName,
				L: "target ran away, started to patrol",
				N2: character.charName,
				T: time,
			}))
			this.setState(Utils.CHARACTER_STATES.PATROL, null)
			this.wander(time)
		} else {
			Logger.info(JSON.stringify({
				N1: this.charName,
				L: "target is out of attack range, started to chase",
				N2: character.charName,
				T: time,
			}))
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