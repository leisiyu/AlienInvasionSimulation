
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
const { Alien } = require('./Alien.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger
const Map = require('../Map/TempMap.js').TempMap
const CharacterState = require('./CharacterState.js').CharacterState
const Probability = require('./Probability.js').Probability
const MapManager = require("../Map/MapManager.js")
const CharacterBase = require('./CharacterBase.js')


var Townfolk = function(name, position){
	var townfolkThis = this
	// jssim.SimEvent.call(this, 10)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE.TOWNFOLK
	this.speed = Math.floor(Math.random() * 3) + 1
	// this.speed = 10 // test
	this.visualRange = 5
	this.attackRange = 1
	this.attackValue = 10
	this.maxHp = Math.floor(Math.random() * 50) + 50
	this.hp = this.maxHp
	this.hideProbability = new Probability([Utils.CHARACTER_STATES.WANDER, Utils.CHARACTER_STATES.HIDE], [30, 70])
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.lastDirection = ""
	this.inventory = []
	this.state = new CharacterState(Utils.CHARACTER_STATES.WANDER)
	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = async function(deltaTime){

		
		// if character died
		if (townfolkThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }

		// self healing
		if (townfolkThis.hp < townfolkThis.maxHp) {
			townfolkThis.hp ++
		}

		// read messages
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
					townfolkThis.getAttacked(this.time, messageContent.attacker, messageContent.atkValue)
				}
			}
		}
		// check the character's state
		townfolkThis.checkEnemiesAround(time)
		switch(townfolkThis.state.stateType){
			case Utils.CHARACTER_STATES.HIDE:
				townfolkThis.hideOrWander(this.time)
				break
			case Utils.CHARACTER_STATES.WANDER:
				townfolkThis.wander(this.time)
				break
			case Utils.CHARACTER_STATES.RUN_AWAY:

				townfolkThis.runAway(this.time)
				break
			case Utils.CHARACTER_STATES.ATTACK:
				var isSuccessfulAttack = townfolkThis.attack(this.time)

				if (isSuccessfulAttack[0]) {
					// notify the attacked character
					// state type maybe changed in the attack function
					var atkValue = 0
					if (isSuccessfulAttack[1] != null) {
						atkValue = isSuccessfulAttack[1].value
					} else {
						break
					}
					var msg = {
						msgType: "attacked",
						atkValue: atkValue,
						attacker: townfolkThis.charName,
					}
					this.sendMsg(townfolkThis.state.target.simEvent.guid(), {
						content: JSON.stringify(msg)
					})
				}
				break
			case Utils.CHARACTER_STATES.CHASE:
				break

		}

		
	}
}

Townfolk.prototype.getAttacked = function(time, attacker, atkValue){

	if (this.hp <= 0) {return}
	this.hp = this.hp - atkValue

	if (this.hp <= 0) {
		this.state.setState(Utils.CHARACTER_STATES.DIED, null)
		Logger.statesInfo(JSON.stringify({
			N: this.charName,
			S: this.state.stateType,
			P: this.position,
			T: time
		}))
		Logger.info({
			N1: this.charName,
			L: "was killed by",
			N2: attacker,
			T: time,
		})
		CharacterBase.dropInventory(this.inventory, this.position)
		this.state.setState(Utils.CHARACTER_STATES.DIED, null)
		return
	}
	Logger.info({
		N1: this.charName,
		L: "was attacked, and ran away from",
		N2: attacker,
		T: this.time,
	})
	this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(attacker))
	
}

// hide only happen in a building
Townfolk.prototype.hideOrWander = function(time){
	// townfolk may wander/hide in a building
	var newState = this.hideProbability.randomlyPick()
	var oldState = this.state.stateType

	if (newState == Utils.CHARACTER_STATES.HIDE) {
		this.hide(time)
		this.state.setState(newState, null)
		var isInBuilding = MapManager.checkIsInABuilding(this.position)
		if (isInBuilding[0]){
			Logger.info({
				N1: this.charName,
				L: "was hiding in",
				N2: "building" + isInBuilding[1],
				T: time,
			})
		}
		
	} else {
		this.state.setState(newState, null)
		this.wander(time)

		Logger.info({
			N1: this.charName,
			L: "was wandering around",
			N2: "",
			T: time,
		})
	}
}


// if there's a enemy, then runAway
// if has weapon, attack or chase
// change state only
Townfolk.prototype.checkEnemiesAround = function(time){
	var isInBuilding = MapManager.checkIsInABuilding(this.position)
	
	if (isInBuilding[0]) {
		var newState = this.hideProbability.randomlyPick()
		this.state.setState(newState, null)
	} else {
		var enemies = this.checkVisualRange()
		if (enemies.length > 0) {
			if (this.hasWeapon()) {
				var enemy = enemies[Math.floor(Math.random() * enemies.length)]
				if (this.state.target != null) {
					enemy = this.state.target
				} 

				var enemyPos = enemy.position
				if (Math.abs(this.position[0] - enemyPos[0]) + Math.abs(this.position[1] - enemyPos[1]) <= this.attackRange) {
					this.state.setState(Utils.CHARACTER_STATES.ATTACK, enemy)
				} else {
					this.state.setState(Utils.CHARACTER_STATES.CHASE, enemy)
				}
						
			} else {
				if (this.state.stateType != Utils.CHARACTER_STATES.RUN_AWAY) {
					var randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
					this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomEnemy)
				} else{
					// state: run away
					// check if the enemy is in visual range
					if (!enemies.includes(this.state.target)){
						var randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
						this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomEnemy)
					}
				}
			}
			
			return true
		}
		this.state.setState(Utils.CHARACTER_STATES.WANDER, null)
		return false
	}
	
}

Townfolk.prototype.hide = function(time){
	this.lastDirection = ""
	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType, 
		P: this.position,
		T: time,
	}))
}

Townfolk.prototype.runAway = function(time){
	Logger.info({
		N1: this.charName,
		L: "ran away from",
		N2: this.state.target.charName,
		T: time,
	})
	
	for (let i = 0; i < this.speed; i++){
		var oppositDir = this.getRunAwayDirection()
		if (oppositDir.length > 0) {
			this.moveOneStep(oppositDir, time)
		}	
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType, 
		P: this.position,
		T: time,
	}))
	
	// this.checkEnemiesAround(time)
}

Townfolk.prototype.getRunAwayDirection = function(){
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

// one unit per time
// if at border.....
// Townfolk.prototype.runawaySingleMove = function(time){
// 	var oppositDir = this.getRunAwayDirection()
	
// 	randomIdx = Math.floor(Math.random() * oppositDir.length)
// 	randomDirection = oppositDir[randomIdx]
// 	var result = this.runAwayOneDirection(randomDirection, time)
// 	if (!result) {
// 		// if the first direction doesn't work
// 		// try the other direction
// 		// if can not move too, then randomly choose a direction and run
// 		var result2 = this.runAwayOneDirection(randomDirection % 1, time)
// 		if (!result2){
// 			var randomDirection2 = Math.floor(Math.random() * 2)
// 			if (this.position[randomDirection2] - 1 >= 0) {
// 				this.position[randomDirection2] = this.position[randomDirection2] - 1
// 			} else if (this.position[randomDirection2] + 1 < Utils.MAP_SIZE[randomDirection2]){
// 				this.position[randomDirection2] = this.position[randomDirection2] + 1
// 			}
// 		}
// 	}
// }

// Townfolk.prototype.runAwayOneDirection = function(direction, time){
// 	var enemyPosition = this.state.target.position
	
// 	if (enemyPosition[direction] > this.position[direction]) {
// 		if (this.position[direction] - 1 >= 0) {
// 			this.position[direction] = this.position[direction] - 1
// 			return true
// 		} else {
// 			return false
// 		}
// 	} else if (enemyPosition[direction] < this.position[randomDirection]) {
// 		if (this.position[direction] + 1 < Utils.MAP_SIZE[direction]) {
// 			this.position[direction] = this.position[direction] + 1
// 			return true
// 		} else {
// 			return false
// 		}
// 	} else {
// 		if (this.position[direction] - 1 >= 0) {
// 			this.position[direction] = this.position[direction] - 1
// 			return true
// 		} else if (this.position[direction] + 1 < Utils.MAP_SIZE[direction]) {
// 			this.position[direction] = this.position[direction] + 1
// 			return true
// 		} else {
// 			return false
// 		}
// 	}
// }


Townfolk.prototype.wander = function(time){
	for (let i = 0; i < this.speed; i++) {
		var availableDirections = this.getAvailableDirectionsForPatrol()
		this.moveOneStep(availableDirections, time)
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType,
		P: this.position,
		T: time,
	}))

	// // if come into a building, then have chance to hide
	// var isInBuilding = MapManager.checkIsInABuilding(this.position)
	// if (isInBuilding[0]) {
	// 	var newState = this.hideProbability.randomlyPick()
	// 	if (newState != this.state.stateType) {
	// 		this.state.setState(newState, null)
	// 	}
	// } else {
	// 	this.checkEnemiesAround()
	// }
}

Townfolk.prototype.moveOneStep = function(availableDirections, time){
	var result = CharacterBase.moveOneStep(this.lastDirection, availableDirections, this.directionProbability, this.position, this.inventory, time, this.charName)
	this.lastDirection = result[0]
	this.position = result[1]
// 	var direction
// 	if (this.lastDirection == "") {
// 		direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
// 	} else {
// 		var idx = availableDirections.indexOf(this.lastDirection)

// 		if (idx < 0) {
// 			direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
// 		} else {
// 			var newWeights = []
// 			for (let i = 0; i < Utils.DIRECTION.length; i++) {
// 				if (i == idx) {
// 					newWeights.push(30)
// 				} else (
// 					newWeights.push(10)
// 				)
// 			}
// 			this.directionProbability.updateWeights(newWeights)
// 			direction = this.directionProbability.randomlyPick()
// 		}
// 	}

// 	this.lastDirection = direction

// 	switch(direction){
// 		case Utils.DIRECTION[0]:
// 			// this.position[1] = this.position[1] - 1 < 0 ? 0 : this.position[1] - 1
// 			this.position[1] = this.position[1] - 1
// 			break
// 		case Utils.DIRECTION[1]:
// 			// this.position[1] = this.position[1] + 1 >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + 1
// 			this.position[1] = this.position[1] + 1
// 			break
// 		case Utils.DIRECTION[2]:
// 			// this.position[0] = this.position[0] - 1 < 0 ? 0 : this.position[0] - 1
// 			this.position[0] = this.position[0] - 1
// 			break;
// 		case Utils.DIRECTION[3]:
// 			// this.position[0] = this.position[0] + 1 >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + 1
// 			this.position[0] = this.position[0] + 1
// 			break
// 	}
}

Townfolk.prototype.getAvailableDirectionsForPatrol = function(){
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

Townfolk.prototype.checkVisualRange = function(){
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
				// console.log(this.charName + " saw " + character.charName)
			}
	}
	
	return visibleEnemies
}

Townfolk.prototype.hasWeapon = function(){
	if (this.inventory.length <= 0) {return false}
	for (let i = 0; i < this.inventory.length; i++){
		var gear = this.inventory[i]
		if (gear.gearType == Utils.GEAR_TYPES[1]) {
			return true
		}
	}
	return false
}

Townfolk.prototype.attack = function(time){
	var result = CharacterBase.attack(this, time)
	// this.checkEnemiesAround(time)

	return result
}

module.exports = {
	Townfolk,
}