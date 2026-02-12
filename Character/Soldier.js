
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger
// const Mission = require('./CharacterState.js').Mission
const CharacterState = require('./CharacterState.js').CharacterState
const Probability = require('./Probability.js').Probability
const CharacterBase = require('./CharacterBase.js')
const MapManager = require("../Map/MapManager.js")
const Gear = require('../Map/Gear.js').Gear
const ORDER_TYPE = require('../DramaManager/Order.js').ORDER_TYPE

var Soldier = function(name, position){
	// jssim.SimEvent.call(this, 20)
	this.charName = name
	this.position = position
	this.objType = Utils.CHARACTER_TYPE.SOLDIER
	this.baseSpeed = Math.floor(Math.random() * 5) + 3
	// this.baseSpeed = 15 // test
	this.speed = this.baseSpeed
	this.visualRange = 5
	this.attackRange = Math.floor(Math.random() * 2) + 1
	this.maxHp = Math.floor(Math.random() * 200) + 200
	this.hp = this.maxHp
	this.baseAttackValue = Math.floor(Math.random() * 100) + 10
	this.attackValue = this.baseAttackValue
	this.criticalHitProbability = new Probability(Utils.ATTACK_TYPE, [80, 20])
	this.state = new CharacterState()
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.lastDirection = ""
	this.inventory = []
	var weapon = this.createWeapon()
	this.inventory.push(weapon)
	this.healthState = Utils.HEALTH_STATES.NORMAL
	this.beHealedIdx = 0
	this.healingIdx = 0
	this.orders = []
	this.order = null
	var soldierThis = this

	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = function(deltaTime){

		// if character died
		if (soldierThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }

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
					if (soldierThis.hp <= 0) {return}
					soldierThis.hp = soldierThis.hp - messageContent.atkValue
					if (soldierThis.hp <= 0) {
						soldierThis.state.setState(Utils.CHARACTER_STATES.DIED, null)
						Logger.info({
							N1: soldierThis.charName,
							L: "is killed by",
							N2: messageContent.attacker,
							T: this.time,
						})
						Logger.statesInfo(JSON.stringify({
							N: soldierThis.charName,
							S: soldierThis.state.stateType,
							P: soldierThis.position,
							T: this.time
						}))
						// console.log("hahah1111   " + soldierThis.charName + " " + messageContent.attacker)
						CharacterBase.dropInventory(soldierThis.inventory, soldierThis.position)
					} else {
						if (soldierThis.state.stateType == Utils.CHARACTER_STATES.HEAL){
							Logger.info({
								N1: soldierThis.charName,
								L: "healing process is interupted by ",
								N2: messageContent.attacker,
								T: this.time,
							})
							soldierThis.healingIdx = 0
						}
						if (soldierThis.healthState <= Utils.HEALTH_STATES.HURT && soldierThis.healthState > Utils.HEALTH_STATES.INCAPACITATED){
							Logger.info({
								N1: soldierThis.charName,
								L: "is badly hurt, runs away from",
								N2: messageContent.attacker,
								T: time,
							})
							soldierThis.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(messageContent.attacker))
						} else {
							Logger.info({
								N1: soldierThis.charName,
								L: "is attacked by",
								N2: messageContent.attacker,
								T: time,
							})
							soldierThis.state.setState(Utils.CHARACTER_STATES.CHASE, CharactersData.getCharacterByName(messageContent.attacker))
						}
						
					}

				} else if (messageContent.msgType.valueOf() == "heal".valueOf()){		
					if (soldierThis.beHealedIdx < Utils.HEAL_STEP) {
						soldierThis.beHealedIdx ++
						soldierThis.hp = soldierThis.hp + messageContent.value 
						if (soldierThis.hp > soldierThis.maxHp) {
							soldierThis.hp = soldierThis.maxHp
							soldierThis.beHealedIdx = Utils.HEAL_STEP
						}
						if (soldierThis.beHealedIdx >= Utils.HEAL_STEP) {
							// soldierThis.hp = soldierThis.maxHp
							// soldierThis.beHealedIdx = 0
							Logger.info({
								N1: soldierThis.charName,
								L: "is healed by",
								N2: messageContent.healer,
								T: time,
							})
						}
						
					}
				}
			}
		}

		soldierThis.updateHealthStates(this.time)
		soldierThis.updateStates(this.time)

		// has order
		// in neutral state
		// console.log("soldier state " + soldierThis.charName + " " + soldierThis.state.stateType)
		// if (soldierThis.order != null && Utils.NEUTRAL_STATES.includes(soldierThis.state.stateType)) {
		if (soldierThis.orders.length != 0){
			// console.log("hahaha   soldier order" + " " + soldierThis.charName + " " + soldierThis.order.orderType + this.time)
			soldierThis.order = CharacterBase.chooseOrderWithHighestPriority(soldierThis.orders)
			soldierThis.order.excute()
			switch(soldierThis.order.orderType){
				case ORDER_TYPE.MOVE:
					// soldierThis.chase(this.time)
					break
				case ORDER_TYPE.ATTACK:
					var isSuccessfullyAttack = soldierThis.orderAttack(this.time)

					if (isSuccessfullyAttack) {
						// notify the attacked character
						// state type maybe changed in the attack function
						var attackType = soldierThis.criticalHitProbability.randomlyPick()
						var attackRatio = attackType == Utils.ATTACK_TYPE[0] ? 1 : Utils.CRITICAL_HIT
						var msg = {
							msgType: "attacked",
							atkValue: Math.floor(soldierThis.attackValue * attackRatio),
							attacker: soldierThis.charName,
						}
						this.sendMsg(soldierThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					
					}
					break
				case ORDER_TYPE.CHASE:
					var isSuccessfullyChase = soldierThis.orderChase(this.time)
					
					break
				case ORDER_TYPE.HEAL:
					var isSuccessfullyHeal = soldierThis.orderHeal(this.time)
					if (isSuccessfullyHeal[0]) {
						soldierThis.healingIdx++
						var msg = {
							msgType: "heal",
							healer: soldierThis.charName,
							value: isSuccessfullyHeal[1],
						}
						this.sendMsg(soldierThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					} 
					break
				case ORDER_TYPE.KILL:
					var isSuccessfullyAttack = soldierThis.orderAttack(this.time)

					if (isSuccessfullyAttack) {
						// notify the attacked character
						// state type maybe changed in the attack function
						var msg = {
							msgType: "attacked",
							atkValue: Math.floor(soldierThis.attackValue * Utils.CRITICAL_HIT),
							attacker: soldierThis.charName,
						}
						this.sendMsg(soldierThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					
					}
					break
				case ORDER_TYPE.RUN_AWAY:
					soldierThis.orderRunAway(this.time)
					break
			}
		} else {
			// check the character's state
			switch(soldierThis.state.stateType){
				// case Utils.CHARACTER_STATES.HIDE:
				// 	break
				case Utils.CHARACTER_STATES.PATROL:
					soldierThis.wander(this.time)
					break
				case Utils.CHARACTER_STATES.CHASE:
					soldierThis.chase(this.time)
					break
				case Utils.CHARACTER_STATES.RUN_AWAY:
					soldierThis.runAway(this.time)
					break
				case Utils.CHARACTER_STATES.ATTACK:
					var isSuccessfullyAttack = soldierThis.attack(this.time)

					if (isSuccessfullyAttack[0]) {
						// notify the attacked character
						// state type maybe changed in the attack function
						if (soldierThis.state.stateType == Utils.CHARACTER_STATES.ATTACK){
							var attackType = soldierThis.criticalHitProbability.randomlyPick()
							var attackRatio = attackType == Utils.ATTACK_TYPE[0] ? 1 : Utils.CRITICAL_HIT
							var atkValue = Math.floor(soldierThis.attackValue * attackRatio)

							if (isSuccessfullyAttack[1] != null) {
								atkValue = Math.floor(isSuccessfullyAttack[1].value * attackRatio)
							}
							var msg = {
								msgType: "attacked",
								atkValue: atkValue,
								attacker: soldierThis.charName,
							}
							this.sendMsg(soldierThis.state.target.simEvent.guid(), {
								content: JSON.stringify(msg)
							})
						}
					}
					break
				case Utils.CHARACTER_STATES.STAY:
					soldierThis.stay(this.time)
					break
				case Utils.CHARACTER_STATES.HEAL:
					var isSuccessfulHeal = soldierThis.heal(this.time)
					if (isSuccessfulHeal[0]) {
						soldierThis.healingIdx++
						var msg = {
							msgType: "heal",
							healer: soldierThis.charName,
							value: isSuccessfulHeal[1],
						}
						this.sendMsg(soldierThis.state.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					} else {
						soldierThis.state.setState(Utils.CHARACTER_STATES.PATROL, null)
					}

					break
			}
		}
		


		CharacterBase.checkOrder(soldierThis)
	}
}

Soldier.prototype.updateHealthStates = function(time){
	// var previousHealthState = this.healthState
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
			if (this.speed <= 0) { this.speed = 1 }
			this.attackValue =  Math.floor(this.baseAttackValue * 0.8)
			if (this.hp > 0) {
				this.hp = this.hp - 2
			}
			break
		case Utils.HEALTH_STATES.INCAPACITATED:
			this.speed = 0
			if (this.hp > 0) {
				this.hp = this.hp - 5
			}
			this.attackValue = Math.floor(this.baseAttackValue * 0.4)
			// if (previousHealthState == Utils.HEALTH_STATES.HURT) {
			// 	Logger.info({
			// 		"N1": this.charName,
			// 		"L": "the injury worsened",
			// 		"N2": "",
			// 		"T": time,
			// 	})
			// } else {
				Logger.info({
					"N1": this.charName,
					"L": "is incapacitated, can't move anymore, need cure",
					"N2": "",
					"T": time,
				})
			// }

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
			break
	}
}

Soldier.prototype.createWeapon = function(){
	var keys = Object.keys(Utils.WEAPONS)
    if (keys.length <= 0) {
        return
    }
	var randomSubType = keys[Math.floor(keys.length * Math.random())]
	var valueMin = Utils.WEAPONS[randomSubType].value[0]
    var valueMax = Utils.WEAPONS[randomSubType].value[1]
    var randomValue = Math.floor(Math.random() * (valueMax - valueMin + 1)) + valueMin
	var weapon = new Gear(Utils.GEAR_TYPES[1], randomSubType, randomValue, Utils.WEAPONS[randomSubType].durability)

	return weapon
}

Soldier.prototype.stay = function(time){
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

// step length == 1
Soldier.prototype.wander = function(time){
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

Soldier.prototype.heal = function(time) {
	if (this.healingIdx >= Utils.HEAL_STEP) {
		this.state.setState(Utils.CHARACTER_STATES.WANDER, null)
		this.healingIdx = 0
		return [false]
	}

	var result = CharacterBase.hasMediKit(this.inventory)
	if (!result[0]) {
		this.state.setState(Utils.CHARACTER_STATES.WANDER, null)
		this.healingIdx = 0
		return [false]
	}

	CharacterBase.heal(this.healingIdx, this.charName, this.state.target.charName, result[1], this.inventory, time)
	return [true, result[1].value]
}

Soldier.prototype.moveOneStep = function(availableDirections, time){
	if (availableDirections.length <= 0) {return}

	var result = CharacterBase.moveOneStep(this.lastDirection, availableDirections, this.directionProbability, this.position, this.inventory, time, this.charName)
	this.lastDirection = result[0]
	this.position = result[1]
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

	// switch(direction){
	// 	case Utils.DIRECTION[0]:
	// 		this.position[1] = this.position[1] - 1 < 0 ? 0 : this.position[1] - 1
	// 		break
	// 	case Utils.DIRECTION[1]:
	// 		this.position[1] = this.position[1] + 1 >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + 1
	// 		break
	// 	case Utils.DIRECTION[2]:
	// 		this.position[0] = this.position[0] - 1 < 0 ? 0 : this.position[0] - 1
	// 		break;
	// 	case Utils.DIRECTION[3]:
	// 		this.position[0] = this.position[0] + 1 >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + 1
	// 		break
	// }
}

Soldier.prototype.getAvailableDirectionsForPatrol = function(){
	var availableDirections = CharacterBase.getAvailableDirectionsForPatrol(this.position, this.objType)

	return availableDirections
}

Soldier.prototype.runAway = function(time){
	Logger.info({
		N1: this.charName,
		L: "runs away from",
		N2: this.state.target.charName,
		T: time,
	})

	for (let i = 0; i < this.speed; i++){
		var oppositDir = this.getRunAwayDirection()	
		this.moveOneStep(oppositDir, time)
		
	}

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType, 
		P: this.position,
		T: time,
	}))
	
	if (this.healthState > Utils.HEALTH_STATES.HURT) {
		var enemies = this.checkVisualRange()[0]
		if (enemies.length <= 0) {
			Logger.info({
				N1: this.charName,
				L: "recovered, start to partrol",
				N2: "",
				T: time,
			})
			this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		} else {
			randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
			Logger.info({
				N1: this.charName,
				L: "recovered, start to chase",
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
		var characterName = this.state.target.charName
		Logger.info({
			N1: this.charName,
			L: "successfully ran away from",
			N2: characterName,
			T: time,
		})
		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	}
}

Soldier.prototype.getRunAwayDirection = function(){
	var oppositDir = CharacterBase.getAwayTargetDirection(this.objType, this.position, this.state.target)
	return oppositDir
	// var oppositDir = []
	// if (this.position[0] - this.state.target.position[0] > 0) {
	// 	oppositDir.push(Utils.DIRECTION[3])
	// } else if (this.position[0] - this.state.target.position[0] < 0) {
	// 	oppositDir.push(Utils.DIRECTION[2])
	// } else {
	// 	oppositDir.push(Utils.DIRECTION[2])
	// 	oppositDir.push(Utils.DIRECTION[3])
	// }

	// if (this.position[1] - this.state.target.position[1] > 0) {
	// 	oppositDir.push(Utils.DIRECTION[1])
	// } else if (this.position[1] - this.state.target.position[0] < 1) {
	// 	oppositDir.push(Utils.DIRECTION[0])
	// } else {
	// 	oppositDir.push(Utils.DIRECTION[0])
	// 	oppositDir.push(Utils.DIRECTION[1])
	// }

	// return oppositDir
}

Soldier.prototype.chase = function(time){
	Logger.info({
		N1: this.charName,
		L: "is chasing",
		N2: this.state.target.charName,
		T: time,
	})
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
	var result = CharacterBase.attack(this, time)
	return result
	// // check if the character died
	// if (this.state.target.state.stateType == Utils.CHARACTER_STATES.DIED) {
		
	// 	this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	// 	this.wander(time)
	// 	return false
	// }		

	// // check attack range
	// var character = this.state.target
	// var distance = Math.abs(this.position[0] - character.position[0]) + Math.abs(this.position[1] - character.position[1])
	// if (distance > this.attackRange) {
	// 	// this frame still need to move
	// 	if (distance > this.visualRange) {
	// 		Logger.info({
	// 			N1: this.charName,
	// 			L: "target ran away, started to patrol",
	// 			N2: character.charName,
	// 			T: time,
	// 		})
	// 		this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	// 		this.wander(time)
	// 	} else {
	// 		Logger.info({
	// 			N1: this.charName,
	// 			L: "target is out of attack range, started to chase",
	// 			N2: character.charName,
	// 			T: time,
	// 		})
	// 		this.state.setState(Utils.CHARACTER_STATES.CHASE, character)
	// 		this.chase(time)
	// 	}
	// 	return false
	// }

	// Logger.info({
	// 	N1: this.charName,
	// 	L: "attacked",
	// 	N2: character.charName,
	// 	T: time,
	// })
	// return true
}

Soldier.prototype.updateStates = function(time){
	// check health state, if incapacitated, can not move or attack
	if (this.healthState == Utils.HEALTH_STATES.DIED){
		this.state.setState(Utils.CHARACTER_STATES.DIED, null)
		return 
	}
	else if (this.healthState <= Utils.HEALTH_STATES.INCAPACITATED && this.healthState > Utils.HEALTH_STATES.DIED) {
		this.state.setState(Utils.CHARACTER_STATES.STAY, null)
		return 
	// } else if (this.healthState <= Utils.HEALTH_STATES.HURT && this.healthState > Utils.HEALTH_STATES.INCAPACITATED) {
	// 	// can walk around
	// 	// if the original state is stay, keep it
	// 	if (this.state.stateType == Utils.CHARACTER_STATES.RUN_AWAY){
	// 		return 
	// 	} else {

	// 	}
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

	// healing...3 beats
	if (this.state.stateType == Utils.CHARACTER_STATES.HEAL){
		if (this.state.target.beHealedIdx < Utils.HEAL_STEP && this.healingIdx < Utils.HEAL_STEP) {
			return
		}

		// previous state is HEAL
		// check target's hp, if full, switch to other state
		// check healing index, if more than heal step, switch to other state
		if (this.healingIdx >= Utils.HEAL_STEP
			|| this.state.target.hp >= this.state.target.maxHp) {
			this.state.target.beHealedIdx = 0
			this.healingIdx = 0
			this.state.setState(Utils.CHARACTER_STATES.WANDER, null)
		}
	}

	//// check other characters

	//// check the visual range
	//// if there's an enemy around, chase him first
	//// if already chasing someone, check if he's in the visual range
	//// else wander around
	var visibleEnemies = this.checkVisualRange()[0]
	if (visibleEnemies.length > 0){
		if (this.healthState <= Utils.HEALTH_STATES.HURT && this.healthState > Utils.HEALTH_STATES.INCAPACITATED) {
			// TO DO 
			// the original state is run_away,
			var randomVisibleCharacter = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)]
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, randomVisibleCharacter)
			return 
		}
		if (this.state.stateType == Utils.CHARACTER_STATES.CHASE || this.state.stateType == Utils.CHARACTER_STATES.ATTACK){
			if (!visibleEnemies.includes(this.state.target)){
				var randomVisibleCharacter = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)]
				if (CharacterBase.calDistanceOfCharacters(this, randomVisibleCharacter) <= this.attackRange) {
					this.state.setState(Utils.CHARACTER_STATES.ATTACK, randomVisibleCharacter)
				} else {
					this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
				}
			} else {
				if (CharacterBase.calDistanceOfCharacters(this, this.state.target) <= this.attackRange) {
					this.state.updateState(Utils.CHARACTER_STATES.ATTACK)
				} else {
					this.state.updateState(Utils.CHARACTER_STATES.CHASE)
				}
			}
		} else {
				var randomVisibleCharacter = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)]
				if (CharacterBase.calDistanceOfCharacters(this, randomVisibleCharacter) <= this.attackRange) {
					this.state.setState(Utils.CHARACTER_STATES.ATTACK, randomVisibleCharacter)
				} else {
					this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
				}
		}
		return
	}

	// check allies
	var visibleAllies = this.checkVisualRange()[1]
	if (visibleAllies.length > 0 && CharacterBase.hasMediKit(this.inventory)[0]) {
		for (let i = 0; i < visibleAllies.length; i++) {
			var ally = visibleAllies[i]
			if (ally.healthState < Utils.HEALTH_STATES.NORMAL 
				&& ally.healthState != Utils.HEALTH_STATES.DIED
				&& this.healingIdx < Utils.HEAL_STEP 
				&& ally.beHealedIdx < Utils.HEAL_STEP){
				this.state.setState(Utils.CHARACTER_STATES.HEAL, ally)
				return
			}
		}
	}

	this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
	return 
}

Soldier.prototype.checkVisualRange = function(){
	var startX = this.position[0] - this.visualRange < 0 ? 0 : this.position[0] - this.visualRange
	var endX = this.position[0] + this.visualRange >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + this.visualRange
	var startY = this.position[1] - this.visualRange < 0 ? 0 : this.position[1] - this.visualRange
	var endY = this.position[1] + this.visualRange >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + this.visualRange

	var visibleEnemies = []
	var visibleFriends = []
	for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		var characterPos = character.position
		if (character.state.stateType != Utils.CHARACTER_STATES.DIED
			&& characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.charName != this.charName) {
				if (character.objType == Utils.CHARACTER_TYPE.ALIEN) {
					visibleEnemies.push(character)
				} else {
					visibleFriends.push(character)
				}
				
			}
	}
	
	return [visibleEnemies, visibleFriends]
}
//------order-------
Soldier.prototype.orderAttack = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	var result = CharacterBase.orderAttack(this, time)
	return result
}
Soldier.prototype.orderChase = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	var result = CharacterBase.orderChase(this, time)
	return result
}
Soldier.prototype.orderHeal = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	var result = CharacterBase.orderHeal(this, time)
	return result
}
Soldier.prototype.orderRunAway = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)
	CharacterBase.orderRunAway(this.charName, this.order.target, time)
}

//------order-------




module.exports = {
	Soldier,
}