
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



var Townfolk = function(name, position){
	var townfolkThis = this
	// jssim.SimEvent.call(this, 10)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE.TOWNFOLK
	this.speed = 1
	this.visualRange = 3
	this.attackRange = 1
	this.attackValue = 10
	this.hp = 100
	this.hideProbability = new Probability([Utils.CHARACTER_STATES.WANDER, Utils.CHARACTER_STATES.HIDE], [10, 90])
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.lastDirection = ""
	this.state = new CharacterState(Utils.CHARACTER_STATES.WANDER)
	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = async function(deltaTime){
		
		// if character died
		if (townfolkThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }

		// check the character's state
		switch(townfolkThis.state.stateType){
			case Utils.CHARACTER_STATES.HIDE:
				// check visual range first
				if (townfolkThis.checkEnemiesAround(this.time)) {
					townfolkThis.runAway(this.time)
					break
				}

				townfolkThis.hideOrWander(time)
				break
			case Utils.CHARACTER_STATES.WANDER:
				// check visual range first
				if (townfolkThis.checkEnemiesAround(this.time)) {
					townfolkThis.runAway(this.time)
					break
				}
				townfolkThis.hideOrWander(this.time)
				break
			case Utils.CHARACTER_STATES.CHASE:
				break
			case Utils.CHARACTER_STATES.RUN_AWAY:
				// check visual range first
				if (!townfolkThis.checkEnemiesAround(this.time)) {
					townfolkThis.hideOrWander(this.time)
					break
				}
				townfolkThis.runAway(this.time)
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
				// Logger.info(content)
				var messageContent = JSON.parse(content)
				// switch (messageContent.action) {
				// 	case Utils.CHARACTER_STATES.CHASE:
				// 		// townfolkThis.runAway(messageContent)
				// 		var character = CharactersData.getCharacterByName(messageContent.Character2Name)
				// 		if (character) {
				// 			townfolkThis.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, {Character: character})
				// 		}
				// 		break
				// 	//// TO DO: finish all the other cases
				// }
				if (messageContent.msgType == "attacked") {
					console.log(townfolkThis.attackRange.charName + " " + msgContent.attacker)
					townfolkThis.hp = townfolkThis.hp - messageContent.atkValue
					if (townfolkThis.hp <= 0) {
						townfolkThis.state.setState(Utils.CHARACTER_STATES.DIED, null)
						Logger.info(JSON.stringify({
							N1: townfolkThis.charName,
							L: "was killed by",
							N2: msgContent.attacker,
							T: this.time,
						}))
						return
					}
					townfolkThis.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(msgContent.attacker))
				}
			}
		}
	}
}

Townfolk.prototype.hideOrWander = function(time){
	// townfolk may wander/hide
	var newState = this.hideProbability.randomlyPick()
	this.state.setState(newState, null)
	if (newState == Utils.CHARACTER_STATES.HIDE) {
		this.hide(time)
	} else {
		this.wander(time)
	}
}


// if there's a enemy, then runAway
Townfolk.prototype.checkEnemiesAround = function(time){
	var enemies = this.checkVisualRange()
	if (enemies.length > 0) {
		if (this.state.stateType != Utils.CHARACTER_STATES.RUN_AWAY) {
			var randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomEnemy)
		}	
		// this.runAway(time)
		return true
	}
	return false
}

Townfolk.prototype.hide = function(time){
	Logger.info(JSON.stringify({
		N1: this.charName,
		L: "was hiding in ",
		N2: this.position,
		T: time,
	}))
	this.lastDirection = ""
}

Townfolk.prototype.runAway = function(time){
	Logger.info(JSON.stringify({
		N1: this.charName,
		L: " ran away from ",
		N2: this.state.target.charName,
		T: time,
	}))
	// console.log(this.charName + " tried to run away from " + this.state.target.charName)

	// for(let i = 0; i < this.speed; i++){
	// 	this.runawaySingleMove(time)
	// }
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
		A: "m", 
		P: this.position,
		T: time,
	}))
	
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
	 

	var newPosition = [Number(JSON.stringify(this.position[0])), Number(JSON.stringify(this.position[1]))]
	switch(direction){
		case Utils.DIRECTION[0]:
			newPosition[1] = newPosition[1] - this.speed < 0 ? 0 : newPosition[1] - this.speed
			break
		case Utils.DIRECTION[1]:
			newPosition[1] = newPosition[1] + this.speed >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : newPosition[1] + this.speed
			break
		case Utils.DIRECTION[2]:
			newPosition[0] = newPosition[0] - this.speed < 0 ? 0 : newPosition[0] - this.speed
			break;
		case Utils.DIRECTION[3]:
			newPosition[0] = newPosition[0] + this.speed >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : newPosition[0] + this.speed
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
			&& character.status != Utils.CHARACTER_STATES.DIED) {
				visibleEnemies.push(character)
				// console.log(this.charName + " saw " + character.charName)
			}
	}
	
	return visibleEnemies
}

module.exports = {
	Townfolk,
}