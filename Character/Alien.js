
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
const ORDER_TYPE = require('../DramaManager/Order.js').ORDER_TYPE

var Alien = function(name, position){
	// jssim.SimEvent.call(this)
	this.charName = name
	this.position = position
	this.objType = Utils.CHARACTER_TYPE.ALIEN
	var alienThis = this
	this.baseSpeed = Math.floor(Math.random() * 5) + 1
	this.speed = this.baseSpeed
	this.visualRange = Math.floor(Math.random() * 3) + 3
	this.attackRange = Math.floor(Math.random() * 2) + 1
	this.maxHp = Math.floor(Math.random() * 300) + 100
	// this.maxHp = 200  // test
	this.hp = this.maxHp
	// this.inventory = []
	this.baseAttackValue = Math.floor(Math.random() * 150) + 10
	this.attackValue = this.baseAttackValue
	this.criticalHitProbability = new Probability(Utils.ATTACK_TYPE, [90, 10])
	this.lastDirection = ""
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.TARGET = ["enemy", "building"]
	this.enemyOrBuildingProbability = new Probability(this.TARGET, [4, 1])
	this.state = new CharacterState()
	this.healthState = Utils.HEALTH_STATES.NORMAL
	this.orders = []
	this.order = null
	this.simEvent = new jssim.SimEvent(10)
	this.simEvent.update = function(deltaTime){

		// if character died
		if (alienThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }


		// read message before check states
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
							"L": "is killed by",
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
						if (alienThis.healthState <= Utils.HEALTH_STATES.HURT && alienThis.healthState > Utils.HEALTH_STATES.INCAPACITATED) {
							Logger.info({
								"N1": alienThis.charName,
								"L": "is badly hurt, runs away from",
								"N2": msgContent.attacker,
								"T": this.time,
							})
							alienThis.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(msgContent.attacker))
						} else {
							// two conditions:
							// 1. health state >= hurt, can fight back
							// 2. health state < incapacitated, can not move, attack value reduce
							if (alienThis.healthState > Utils.HEALTH_STATES.HURT) {
								Logger.info({
									"N1": alienThis.charName,
									"L": "is attacked by",
									"N2": msgContent.attacker,
									"T": this.time,
								})
							} else {
								Logger.info({
									"N1": alienThis.charName,
									"L": "is incapacitated, can not move",
									"N2": msgContent.attacker,
									"T": this.time,
								})
							}
							
							alienThis.state.setState(Utils.CHARACTER_STATES.ATTACK, CharactersData.getCharacterByName(msgContent.attacker))
						}
						
					}
				}

			}
		}

		// update health state every step
		alienThis.updateHealthStates(this.time)

		alienThis.checkSurrounding(this.time)

		// console.log("alien state " + alienThis.charName + " " + alienThis.state.stateType)
		// if (alienThis.orders.length != 0 & Utils.NEUTRAL_STATES.includes(alienThis.state.stateType)) {
		if (alienThis.orders.length != 0) {
			// has order
			// in neutral state
			alienThis.order = CharacterBase.chooseOrderWithHighestPriority(alienThis.orders)
			console.log("alien orders " + alienThis.orders.length + " " + alienThis.order.orderType + " " + alienThis.order.target.charName)
			alienThis.order.excute()
			switch(alienThis.order.orderType){
				case ORDER_TYPE.MOVE:
					// alienThis.chase(this.time)
					break
				case ORDER_TYPE.ATTACK:
					var isSuccessfulAttack = alienThis.orderAttack(this.time)
					console.log("order attack " + isSuccessfulAttack)
					if (isSuccessfulAttack) {
						// notify the attacked character
						// state type maybe changed in the attack function
						var attackType = alienThis.criticalHitProbability.randomlyPick()
						var attackRatio = attackType == Utils.ATTACK_TYPE[0] ? 1 : Utils.CRITICAL_HIT
						var msg = {
							msgType: "attacked",
							atkValue: Math.floor(alienThis.attackValue * attackRatio),
							attacker: alienThis.charName,
						}
						this.sendMsg(alienThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					
					}
					break
				case ORDER_TYPE.CHASE:
					var isSuccessfulChase = alienThis.orderChase(this.time)	

					break
				case ORDER_TYPE.KILL:
					var isSuccessfullyAttack = alienThis.orderAttack(this.time)
					console.log("order kill " + isSuccessfulAttack)
					if (isSuccessfullyAttack) {
						// notify the attacked character
						// state type maybe changed in the attack function
						var msg = {
							msgType: "attacked",
							atkValue: Math.floor(alienThis.attackValue * Utils.CRITICAL_HIT),
							attacker: alienThis.charName,
						}
						this.sendMsg(alienThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					
					}
					break
				case ORDER_TYPE.RUN_AWAY:
					alienThis.orderRunAway(this.time)
					break
			}
		} else {
			// check the character's state
			switch(alienThis.state.stateType){
				case Utils.CHARACTER_STATES.PATROL:
					alienThis.wander(this.time)
					break
				case Utils.CHARACTER_STATES.CHASE:
					alienThis.chase(this.time)
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
							var attackType = alienThis.criticalHitProbability.randomlyPick()
							var attackRatio = attackType == Utils.ATTACK_TYPE[0] ? 1 : Utils.CRITICAL_HIT
							var msg = {
								msgType: "attacked",
								atkValue: Math.floor(alienThis.attackValue * attackRatio),
								attacker: alienThis.charName,
							}
							this.sendMsg(alienThis.state.target.simEvent.guid(), {
								content: JSON.stringify(msg)
							})
					// }
					}
					
					break
				// case Utils.CHARACTER_STATES.MOVE_TO:
				// 	alienThis.moveTo(this.time)
				// 	break
				case Utils.CHARACTER_STATES.STAY:
					alienThis.stay(this.time)
					break
				case Utils.CHARACTER_STATES.DIED:
					break
			}
		}
		

		CharacterBase.checkOrder(alienThis)
	}
}

Alien.prototype.updateHealthStates = function(time){
	this.healthState = CharacterBase.updateHealthState(this.hp, this.maxHp)
	switch(this.healthState){
		case Utils.HEALTH_STATES.NORMAL:
			this.speed = this.baseSpeed
			if (this.hp < this.maxHp) {
				this.hp = this.hp + 2
			}
			this.attackValue = this.baseAttackValue
			break
		case Utils.HEALTH_STATES.SCRATCHED:
			this.speed = this.baseSpeed
			if (this.hp < this.maxHp) {
				this.hp = this.hp + 1
			}
			this.attackValue = this.baseAttackValue
			break
		case Utils.HEALTH_STATES.HURT:
			this.speed = Math.floor(this.baseSpeed * 0.5)
			this.attackValue =  Math.floor(this.baseAttackValue * 0.8)
			break
		case Utils.HEALTH_STATES.INCAPACITATED:
			this.speed = 0
			if (this.hp > 0) {
				this.hp = this.hp - 5
			}
			this.attackValue = Math.floor(this.baseAttackValue * 0.4)
			Logger.info({
				"N1": this.charName,
				"L": "is incapacitated, can't move anymore, need cure",
				"N2": "",
				"T": time,
			})

			if (this.hp <= 0){
				this.hp = 0
				Logger.info({
					"N1": this.charName,
					"L": "died from fatal injuries that didn't be treated",
					"N2": "",
					"T": time,
				})
				Logger.statesInfo(JSON.stringify({
					N: this.charName,
					S: this.state.stateType,
					P: this.position,
					T: time
				}))
				this.healthState = Utils.HEALTH_STATES.DIED
			}
			break
		case Utils.HEALTH_STATES.DIED:
			this.speed = 0
			this.hp = 0
			this.state.setState(Utils.CHARACTER_STATES.DIED, null)
	}
}

Alien.prototype.checkSurrounding = function(time){
	// check health state, if incapacitated, can not move or attack
	// aliens can not use medicine
	if (this.healthState == Utils.HEALTH_STATES.DIED){
		this.state.setState(Utils.CHARACTER_STATES.DIED, null)
		return Utils.CHARACTER_STATES.DIED
	}
	else if (this.healthState <= Utils.HEALTH_STATES.INCAPACITATED && this.healthState > Utils.HEALTH_STATES.DIED) {
		this.state.setState(Utils.CHARACTER_STATES.STAY, null)
		return Utils.CHARACTER_STATES.STAY
	} else if (this.healthState <= Utils.HEALTH_STATES.HURT && this.healthState > Utils.HEALTH_STATES.INCAPACITATED) {
		// can walk around
		// but if the original state is run_away, keep it
		if (this.state.stateType == Utils.CHARACTER_STATES.RUN_AWAY){
			return Utils.CHARACTER_STATES.RUN_AWAY
		}
	} else if (this.healthState > Utils.HEALTH_STATES.HURT) {
		if (this.state.stateType == Utils.CHARACTER_STATES.RUN_AWAY) {
			Logger.info({
				"N1": this.charName,
				"L": "recovered, stop running away from",
				"N2": this.state.target.charName,
				"T": time,
			})
		}
	}


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

	// if original state is attack
	if (this.state.stateType == Utils.CHARACTER_STATES.ATTACK) {
		if (visibleCharacters.includes(this.state.target)) {
			// var targetPosition = this.state.target.position
			var positionDistance = CharacterBase.calDistanceOfCharacters(this, this.state.target)
			// Math.abs(this.position[0] - targetPosition[0]) + Math.abs(this.position[1] - targetPosition[1])
			if ( positionDistance <= this.attackRange){
				return Utils.CHARACTER_STATES.ATTACK
			} else if (positionDistance > this.attackRange && positionDistance <= this.visualRange) {
				this.state.updateState(Utils.CHARACTER_STATES.CHASE)
				return Utils.CHARACTER_STATES.CHASE
			}
		}
	}

	// TO DO: chase 的检查应该在随机前面
	// if the original state is chase
	if (this.state.stateType == Utils.CHARACTER_STATES.CHASE && this.state.target != null) {
		if (this.state.target.objType != "building" && !CharacterBase.checkIsDied(this.state.target)) {
			if (CharacterBase.calDistanceOfCharacters(this, this.state.target) <= this.attackRange) {
				this.state.updateState(Utils.CHARACTER_STATES.ATTACK)
			}
			return
		}
	}

	var isRandomChoose = false
	var randomResult = "enemy"
	if (visibleBuildings.length > 0 &&  visibleCharacters.length > 0) {
		if (this.healthState <= Utils.HEALTH_STATES.HURT && this.healthState > Utils.HEALTH_STATES.INCAPACITATED) {
			var randomVisibleCharacter = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)]
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomVisibleCharacter)
			return Utils.CHARACTER_STATES.RUN_AWAY
		}

		isRandomChoose = true
		randomResult = this.enemyOrBuildingProbability.randomlyPick()
	}

	if ((visibleCharacters.length > 0 && visibleBuildings.length <= 0) || (isRandomChoose && randomResult == "enemy")){	
		if (this.healthState <= Utils.HEALTH_STATES.HURT && this.healthState > Utils.HEALTH_STATES.INCAPACITATED) {
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
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomBuilding)
			return Utils.CHARACTER_STATES.CHASE
		} else {
			if (randomBuilding.checkIsDestroyed()) {
				this.state.setState(Utils.CHARACTER_STATES.PATROL, "")
				return Utils.CHARACTER_STATES.PATROL
			}

			this.state.setState(Utils.CHARACTER_STATES.DESTROY, randomBuilding)
			
			return Utils.CHARACTER_STATES.DESTROY
		}
	}

	this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	return Utils.CHARACTER_STATES.PATROL
}

// Alien.prototype.moveTo = function(time){
// 	var building = this.state.target

// 	// 	Logger.statesInfo(JSON.stringify({
// 	// 		N: this.charName,
// 	// 		S: this.state.stateType,
// 	// 		P: this.position,
// 	// 		T: time
// 	// 	}))
// 	// 	return
// 	// }

// 	for (let i = 0; i < this.speed; i++) {
// 		var availableDirections = []
// 		var horizontalOffset = this.position[0] - building.position[0]
// 		var verticalOffset = this.position[1] - building.position[1]
// 		if (horizontalOffset < -1) {
// 			availableDirections.push(Utils.DIRECTION[3])
// 		} else if (horizontalOffset > building.size[0] + 1) {
// 			availableDirections.push(Utils.DIRECTION[2])
// 		}

// 		if (verticalOffset < -1) {
// 			availableDirections.push(Utils.DIRECTION[1])
// 		} else if (verticalOffset > building.size[1] + 1) {
// 			availableDirections.push(Utils.DIRECTION[0])
// 		}
// 		this.moveOneStep(availableDirections, time)
// 	}

// 	Logger.statesInfo(JSON.stringify({
// 		N: this.charName,
// 		S: this.state.stateType,
// 		P: this.position,
// 		T: time
// 	}))

// 	// console.log("hahahahahhahaha " + this.charName + " " + building.calculateDistance(this.position) + " " + this.visualRange)
// 	if (building.calculateDistance(this.position) <= this.visualRange) {
// 		Logger.statesInfo(JSON.stringify({
// 			N: this.charName,
// 			S: this.state.stateType,
// 			P: this.position,
// 			T: time
// 		}))
// 		this.state.setState(Utils.CHARACTER_STATES.DESTROY, building)
// 	}

// }

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

	var result = CharacterBase.moveOneStep(this.lastDirection, availableDirections, this.directionProbability, this.position, null, time, this.charName)
	this.lastDirection = result[0]
	this.position = result[1]
}

Alien.prototype.getAvailableDirectionsForPatrol = function(){
	
	var availableDirections = CharacterBase.getAvailableDirectionsForPatrol(this.position, this.objType)

	return availableDirections
}

Alien.prototype.destroy = function(time){
	var building = this.state.target

	var attackType = this.criticalHitProbability.randomlyPick()
	var attackRatio = attackType == Utils.ATTACK_TYPE[0] ? 1 : Utils.CRITICAL_HIT
	building.isAttacked(Math.floor(this.attackValue * attackRatio))
	Logger.info({
		"N1": this.charName,
		"L": "is destroying",
		"N2": "building" + building.idx,
		"T": time,
	})

	//TO DO
	// logger states info?????

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

Alien.prototype.chase = function(time){

	var targetWidth = 1
	var targetHeight = 1
	if (this.state.target.objType == "building") {
		targetWidth = this.state.target.size[0]
		targetHeight = this.state.target.size[1]
		Logger.info({
			N1: this.charName,
			L: "is moving to",
			N2: this.state.target.getName(),
			T: time,
		})
	} else {
		Logger.info({
			N1: this.charName,
			L: "is chasing",
			N2: this.state.target.charName,
			T: time,
		})
	}
	
	var position = this.state.target.position
	this.lastDirection = ""
	for (let j = 0; j < this.speed; j++){
		var availableDirections = []
		var horizontalOffset = position[0] - this.position[0]
		if ( horizontalOffset > targetWidth) {
			availableDirections.push(Utils.DIRECTION[3])
		} else if (horizontalOffset < -targetWidth) {
			availableDirections.push(Utils.DIRECTION[2])
		}
		var verticalOffset = position[1] - this.position[1]
		if (verticalOffset > targetHeight) {
			availableDirections.push(Utils.DIRECTION[1])
		} else if (verticalOffset < -targetHeight) {
			availableDirections.push(Utils.DIRECTION[0])
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
		// this.state.setState(Utils.CHARACTER_STATES.ATTACK, CharactersData.getCharacterByName(characterName))
		this.state.updateState(Utils.CHARACTER_STATES.ATTACK)
	}

}

// attacked -> died
Alien.prototype.attack = function(time){
	// check if the character died
	if (this.state.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		this.wander(time)
		return false
	}		

	// check self hp
	if (this.healthState <= Utils.HEALTH_STATES.HURT && this.healthState > Utils.HEALTH_STATES.INCAPACITATED){
		Logger.info({
			N1: this.charName,
			L: "is badly hurt, runs away from",
			N2: this.state.target.charName,
			T: time
		})
		this.state.updateState(Utils.CHARACTER_STATES.RUN_AWAY)
		this.runAway(time)
		return false
	}

	// check attack range
	var character = this.state.target
	var distance = Math.abs(this.position[0] - character.position[0]) + Math.abs(this.position[1] - character.position[1])
	if (distance > this.attackRange) {
		// incapacitated, can not move
		if (this.healthState < Utils.HEALTH_STATES.INCAPACITATED && this.healthState > Utils.HEALTH_STATES.DIED) {
			this.state.setState(Utils.CHARACTER_STATES.STAY, null)
			this.stay(time)
			return false
		}
		// this frame still need to move
		if (distance > this.visualRange) {
			this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
			this.wander(time)
		} else {
			this.state.setState(Utils.CHARACTER_STATES.CHASE, character)
			this.chase(time)
		}
		return false
	}
	Logger.info({
		N1: this.charName,
		L: "attacks",
		N2: character.charName,
		T: time,
	})
	return true
}

Alien.prototype.stay = function(time){
	Logger.info({
		N1: this.charName,
		L: "stay in place",
		N2: "",
		T: time,
	})

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType, 
		P: this.position,
		T: time,
	}))
}

Alien.prototype.runAway = function(time){
	Logger.info({
		N1: this.charName,
		L: "runs away from",
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
	
	// TO DO
	if (this.healthState > Utils.HEALTH_STATES.HURT) {
		var [enemies, buildings] = this.checkVisualRange()
		if (enemies.length <= 0) {
			Logger.info({
				N1: this.charName,
				L: "successfully ran away, recovered, start to walk around",
				N2: "",
				T: time,
			})
			this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		} else {
			randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
			Logger.info({
				N1: this.charName,
				L: "recovered, start to chase ",
				N2: randomEnemy.charName,
				T: time,
			})
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomEnemy)
		}
		return
	}

	// run away succeed
	// TO DO
	if (this.checkVisualRange()[0].length <= 0) {
		var target = this.state.target

		Logger.info({
			N1: this.charName,
			L: "successfully ran away from",
			N2: target.charName,
			T: time
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
		if (character.state.stateType != Utils.CHARACTER_STATES.DIED 
			&& characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.objType != this.objType
			&& !MapManager.checkIsInABuilding(character.position)[0]
			) {
				visibleCharacters.push(character)
				
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
	// var oppositDir = CharacterBase.getAwayTargetDirection(this.objType, this.position, this.state.target)
	// return oppositDir
	var oppositDir = []
	if (this.position[0] - this.state.target.position[0] > 0 && this.position[0] + 1 < Utils.MAP_SIZE[0]) {
		if (this.checkIfPositionAccessible([this.position[0] + 1, this.position[1]])) {
			oppositDir.push(Utils.DIRECTION[3])
		}	
	} else if (this.position[0] - this.state.target.position[0] < 0 && this.position[0] - 1 >= 0) {
		if (this.checkIfPositionAccessible([this.position[0] - 1, this.position[1]])) {
			oppositDir.push(Utils.DIRECTION[2])
		}
	} else {
		oppositDir.push(Utils.DIRECTION[2])
		oppositDir.push(Utils.DIRECTION[3])
	}

	if (this.position[1] - this.state.target.position[1] > 0 && this.position[1] + 1 < Utils.MAP_SIZE[1]) {
		if (this.checkIfPositionAccessible([this.position[0], this.position[1] + 1])) {
			oppositDir.push(Utils.DIRECTION[1])
		}
		
	} else if (this.position[1] - this.state.target.position[0] < 1 && this.position[1] - 1 > 0) {
		if (this.checkIfPositionAccessible([this.position[0], this.position[1] - 1])) {
			oppositDir.push(Utils.DIRECTION[0])
		}	
	} else {
		oppositDir.push(Utils.DIRECTION[0])
		oppositDir.push(Utils.DIRECTION[1])
	}

	return oppositDir
}


Alien.prototype.checkIfPositionAccessible = function(pos){
	// check if the position is in a building
	if (MapManager.checkIsInABuilding(pos)[0]) {
		return false
	}

	return true
}

//-------order start-------
Alien.prototype.orderAttack = function(time) {
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	var result = CharacterBase.orderAttack(this, time)
	return result
}
Alien.prototype.orderChase = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	var result = CharacterBase.orderChase(this, time)
	return result
}  
Alien.prototype.orderRunAway = function(time){
	var result = CharacterBase.orderRunAway(this, this.order.target, time)

	if (result) {
		CharacterBase.executeOrderBase(this.charName, this.order, time)
	}
}
//-------order end-------

module.exports = {
	Alien,
}