
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('fs')
const Logger = require('../Logger.js').Logger
const CharacterState = require('./CharacterState.js').CharacterState
const Probability = require('./Probability.js').Probability
const MapManager = require("../Map/MapManager.js")
const CharacterBase = require('./CharacterBase.js')

var Alien = function(name, position){
	// jssim.SimEvent.call(this)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE.ALIEN
	var alienThis = this
	// this.baseSpeed = Math.floor(Math.random() * 5) + 1
	this.baseSpeed = 1 // test
	this.speed = this.baseSpeed
	this.visualRange = 6
	this.attackRange = 2
	this.maxHp = Math.floor(Math.random() * 400) + 200
	// this.maxHp = 9999  // test
	this.hp = this.maxHp
	this.inventory = []
	this.attackValue = Math.floor(Math.random() * 200) + 10
	this.lastDirection = ""
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.TARGET = ["enemy", "building"]
	this.enemyOrBuildingProbability = new Probability(this.TARGET, [1, 1])
	this.state = new CharacterState()
	this.simEvent = new jssim.SimEvent(10)
	this.simEvent.update = function(deltaTime){

		// if character died
		if (alienThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }


		// if hurt, recover a few every step
		if (alienThis.hp < alienThis.maxHp) {
			alienThis.hp = alienThis.hp + 2
		}

		// check the character's state
		switch(alienThis.state.stateType){
			case Utils.CHARACTER_STATES.PATROL:
				var newState = alienThis.checkSurrounding(this.time)
				if (newState == Utils.CHARACTER_STATES.PATROL) {
					alienThis.wander(this.time)
				} else if (newState == Utils.CHARACTER_STATES.CHASE) {
					alienThis.chasePeople(this.time)
				} else if (newState == Utils.CHARACTER_STATES.RUN_AWAY) {
					alienThis.runAway(this.time)
				} else if (newState == Utils.CHARACTER_STATES.DESTROY) {
					alienThis.destroy(this.time)
				} else if (newState == Utils.CHARACTER_STATES.MOVE_TO){
					alienThis.moveTo(this.time)
				}
				break
			case Utils.CHARACTER_STATES.CHASE:
				var newState = alienThis.checkSurrounding(this.time)
				if (newState == Utils.CHARACTER_STATES.PATROL) {
					alienThis.wander(this.time)
					break
				} else if (newState == Utils.CHARACTER_STATES.CHASE) {
					alienThis.chasePeople(this.time)
				} else if (newState == Utils.CHARACTER_STATES.RUN_AWAY) {
					alienThis.runAway(this.time)
					break
				} else if (newState == Utils.CHARACTER_STATES.DESTROY) {
					alienThis.destroy(this.time)
					break
				} else if (newState == Utils.CHARACTER_STATES.MOVE_TO){
					alienThis.moveTo(this.time)
					break
				}

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
			// case Utils.CHARACTER_STATES.MOVE_TO:
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
					if (alienThis.hp <= 0) {return}
					alienThis.hp = alienThis.hp - msgContent.atkValue
					if (alienThis.hp <= 0){
						alienThis.state.setState(Utils.CHARACTER_STATES.DIED, null)
						Logger.info({
							"N1": alienThis.charName,
							"L": "was killed by",
							"N2": msgContent.attacker,
							"T": this.time,
						})
						Logger.statesInfo(JSON.stringify({
							"N": alienThis.charName,
							"S": alienThis.state.stateType,
							"P": alienThis.position,
							"T": this.time
						}))
					} else {
						if (alienThis.isBadlyHurt()) {
							Logger.info({
								"N1": alienThis.charName,
								"L": "was badly hurt, ran away from",
								"N2": msgContent.attacker,
								"T": this.time,
							})
							alienThis.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(msgContent.attacker))
						} else {
							Logger.info({
								"N1": alienThis.charName,
								"L": "was attacked. Fighted back",
								"N2": msgContent.attacker,
								"T": this.time,
							})
							alienThis.state.setState(Utils.CHARACTER_STATES.ATTACK, CharactersData.getCharacterByName(msgContent.attacker))
						}
						
					}
				}

			}
		}

	}
}

Alien.prototype.isBadlyHurt = function(){
	return this.hp / this.maxHp <= 0.3
}

Alien.prototype.checkSurrounding = function(time){
	//// check the visual range
	//// if there's an enemy around, 
		////check self hp first
		////if healthy enough chase it 
		////else run away
	//// if already chasing someone, check if he's in the visual range
	//// else wander around
	var result = this.checkVisualRange()
	var visibleCharacters = result[0]
	var visibleBuildings = result[1]

	var isRandomChoose = false
	var randomResult = "enemy"
	if (visibleBuildings.length > 0 &&  visibleCharacters.length > 0) {
		if (this.isBadlyHurt()) {
			var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomVisibleCharacter)
			return Utils.CHARACTER_STATES.RUN_AWAY
		}
		isRandomChoose = true
		randomResult = this.enemyOrBuildingProbability.randomlyPick()
	}

	if ((visibleCharacters.length > 0 && visibleBuildings.length <= 0) || (isRandomChoose && randomResult == "enemy")){	
		if (this.isBadlyHurt()) {
			var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomVisibleCharacter)
			return Utils.CHARACTER_STATES.RUN_AWAY
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
		return Utils.CHARACTER_STATES.CHASE
	}

	if ((visibleBuildings.length > 0 && visibleCharacters.length <= 0) || (isRandomChoose && randomResult == "building")) {
		var randomBuilding = visibleBuildings[Math.floor(Math.random() * visibleBuildings.length)]
		var distance = randomBuilding.calculateDistance(this.position)
		if (distance > this.visualRange) {
			this.state.setState(Utils.CHARACTER_STATES.MOVE_TO, randomBuilding)
			return Utils.CHARACTER_STATES.MOVE_TO
		} else {
			this.state.setState(Utils.CHARACTER_STATES.DESTROY, randomBuilding)
			randomBuilding.isAttacked(this.attackValue)
			Logger.info({
				"N1": this.charName,
				"L": "was destroying",
				"N2": "building" + randomBuilding.idx,
				"T": time,
			})

			if (randomBuilding.checkIsDestroyed()) {
				this.state.setState(Utils.CHARACTER_STATES.PATROL, "")
				return Utils.CHARACTER_STATES.PATROL
			}
			return Utils.CHARACTER_STATES.DESTROY
		}
	}

	this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	return Utils.CHARACTER_STATES.PATROL
}

Alien.prototype.moveTo = function(time){
	var building = this.state.target

	// for (let i = 0; i < this.speed; i++) {
	// 	if (this.position[0] < building.position[0]) {
	// 		this.position[0] = this.position[0] + 1
	// 	} else if (this.position[0] > building.position[0] + building.size[0]) {
	// 		this.position[0] = this.position[0] - 1
	// 	} else if (this.position[1] < building.position[1]) {
	// 		this.position[1] = this.position[1] + 1
	// 	} else if (this.position[1] > building.position[1] + building.size[1]) {
	// 		this.position[1] = this.position[1] - 1
	// 	}
	// }

	for (let i = 0; i < this.speed; i++) {
		var availableDirections = []
		var horizontalOffset = this.position[0] - building.position[0]
		var verticalOffset = this.position[1] - building.position[1]
		if (horizontalOffset < -1) {
			availableDirections.push(Utils.DIRECTION[3])
		} else if (horizontalOffset > building.size[0] + 1) {
			availableDirections.push(Utils.DIRECTION[2])
		}

		if (verticalOffset < -1) {
			availableDirections.push(Utils.DIRECTION[1])
		} else if (verticalOffset > building.size[1] + 1) {
			availableDirections.push(Utils.DIRECTION[0])
		}
		this.moveOneStep(availableDirections, time)
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType,
		P: this.position,
		T: time
	}))

	// console.log("hahahahahhahaha " + this.charName + " " + building.calculateDistance(this.position) + " " + this.visualRange)
	if (building.calculateDistance(this.position) <= this.visualRange) {
		Logger.statesInfo(JSON.stringify({
			N: this.charName,
			S: this.state.stateType,
			P: this.position,
			T: time
		}))
		this.state.setState(Utils.CHARACTER_STATES.DESTROY, building)
	}

	// 基本不可能到这里
	if (building.checkIsDestroyed()) {
		Logger.info({
			"N1": this.charName,
			"L": "destroyed",
			"N2": "building" + building.idx,
			"T": time,
		})
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	}
}

Alien.prototype.wander = function(time){
	for (let i = 0; i < this.speed; i++) {
		var availableDirections = this.getAvailableDirectionsForPatrol()
		this.moveOneStep(availableDirections, time)
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType,
		P: this.position,
		T: time
	}))
}

Alien.prototype.moveOneStep = function(availableDirections, time){

	var result = CharacterBase.moveOneStep(this.lastDirection, availableDirections, this.directionProbability, this.position, this.inventory, time, this.charName)
	this.lastDirection = result[0]
	this.position = result[1]
	// console.log("hahaha222222 " + this.lastDirection)
	// var direction
	// if (this.lastDirection == "") {
	// 	direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
	// } else {
	// 	var idx = availableDirections.indexOf(this.lastDirection)

	// 	if (idx < 0) {
	// 		direction = availableDirections[Math.floor(Math.random() * availableDirections.length)]
	// 	} else {
	// 		var newWeights = []
	// 		for (let i = 0; i < Utils.DIRECTION.length; i++) {
	// 			if (i == idx) {
	// 				newWeights.push(30)
	// 			} else (
	// 				newWeights.push(10)
	// 			)
	// 		}
	// 		this.directionProbability.updateWeights(newWeights)
	// 		direction = this.directionProbability.randomlyPick()
	// 	}
	// }

	// this.lastDirection = direction

	// var step = 1
	// // check is on a road
	// // speed will be higher when on a road
	// if (MapManager.checkIsOnARoad(this.position)) {
	// 	step = step + 1
	// }
	// switch(direction){
	// 	case Utils.DIRECTION[0]:
	// 		this.position[1] = this.position[1] - step < 0 ? 0 : this.position[1] - step
	// 		break
	// 	case Utils.DIRECTION[1]:
	// 		this.position[1] = this.position[1] + step >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + step
	// 		break
	// 	case Utils.DIRECTION[2]:
	// 		this.position[0] = this.position[0] - step < 0 ? 0 : this.position[0] - step
	// 		break;
	// 	case Utils.DIRECTION[3]:
	// 		this.position[0] = this.position[0] + step >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + step
	// 		break
	// }
}

Alien.prototype.getAvailableDirectionsForPatrol = function(){
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

Alien.prototype.destroy = function(time){
	var building = this.state.target

	building.isAttacked(this.attackValue)
	Logger.info({
		"N1": this.charName,
		"L": "was destroying",
		"N2": "building" + building.idx,
		"T": time,
	})

	if (building.checkIsDestroyed()) {
		Logger.info({
			"N1": this.charName,
			"L": "destroyed",
			"N2": "building" + building.idx,
			"T": time,
		})
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	}
}

Alien.prototype.chasePeople = function(time){
	// if (this.position[0] == this.state.target.position[0]
	// 	&& this.position[1] == this.state.target.position[1]) {
	// 		return
	// }
	
	Logger.info({
		N1: this.charName,
		L: "was chasing",
		N2: this.state.target.charName,
		T: time,
	})
	var position = this.state.target.position
	this.lastDirection = ""
	for (let j = 0; j < this.speed; j++){
		// if (position[0] != this.position[0] && position[1] != this.position[1]) {
		// 	var randomDir = Math.floor(Math.random() * 2)
		// 	this.position[randomDir] = this.position[randomDir] > position[randomDir] ? this.position[randomDir] - 1 : this.position[randomDir] + 1
		// } else if (position[0] != this.position[0]) {
		// 	this.position[0] = this.position[0] > position[0] ? this.position[0] - 1 : this.position[0] + 1
		// } else if (position[1] != this.position[1]) {
		// 	this.position[1] = this.position[1] > position[1] ? this.position[1] - 1 : this.position[1] + 1
		// } else {
		// 	break
		// }
		var availableDirections = []
		var horizontalOffset = position[0] - this.position[0]
		if ( horizontalOffset > 1) {
			availableDirections.push(Utils.DIRECTION[3])
		} else if (horizontalOffset < -1) {
			availableDirections.push(Utils.DIRECTION[2])
		}
		var verticalOffset = position[1] - this.position[1]
		if (verticalOffset > 1) {
			availableDirections.push(Utils.DIRECTION[0])
		} else if (verticalOffset < -1) {
			availableDirections.push(Utils.DIRECTION[1])
		}
		if (availableDirections.length > 0) {
			this.moveOneStep(availableDirections, time)
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
		Logger.info({
			N1: this.charName,
			L: "killed",
			N2: this.state.target.charName,
			T: time,
		})
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		this.wander(time)
		return false
	}		

	// check self hp
	if (this.isBadlyHurt()){
		Logger.info({
			N1: this.charName,
			L: "was badly hurt, ran away from",
			N2: this.state.target.charName,
			T: this.time,
		})
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
			this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
			this.wander(time)
		} else {
			this.state.setState(Utils.CHARACTER_STATES.CHASE, character)
			this.chasePeople(time)
		}
		return false
	}
	Logger.info({
		N1: this.charName,
		L: "attacked",
		N2: character.charName,
		T: time,
	})
	return true
}

Alien.prototype.runAway = function(time){
	Logger.info({
		N1: this.charName,
		L: "ran away from",
		N2: this.state.target.charName,
		T: time,
	})

	for (let i = 0; i < this.speed; i++) {
		var oppositDir = this.getRunAwayDirection()
		this.moveOneStep(oppositDir, time)
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType, 
		P: this.position,
		T: time,
	}))
	
	if (!this.isBadlyHurt()) {
		var [enemies, buildings] = this.checkVisualRange()
		if (enemies.length <= 0) {
			Logger.info({
				N1: this.charName,
				L: "recovered, started to wandering around",
				N2: "",
				T: this.time,
			})
			this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		} else {
			randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
			Logger.info({
				N1: this.charName,
				L: "recovered, started to wandering around",
				N2: randomEnemy.charName,
				T: this.time,
			})
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomEnemy)
		}
		return
	}

	// run away succeed
	if (this.checkVisualRange()[0].length <= 0) {
		var target = this.state.target

		Logger.info({
			N1: this.charName,
			L: "successfully ran away from",
			N2: target.charName,
			T: this.time
		})
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

	var visibleBuildings = []
	for (let i = startX; i <= endX; i++ ){
		for (let j = startY; j <= endY; j++){
			var result = MapManager.checkIsInABuilding([i, j])
			if (result[0]){
				var building = MapManager.getBuilding(result[1])
				if ((!building.checkIsDestroyed()) && !visibleBuildings.includes(building)) {
					visibleBuildings.push(building)
				}
			}
		}
	}
	
	return [visibleCharacters, visibleBuildings]
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