
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

var Soldier = function(name, position){
	// jssim.SimEvent.call(this, 20)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE.SOLDIER
	this.baseSpeed = Math.floor(Math.random() * 5) + 3
	// this.baseSpeed = 15 // test
	this.speed = this.baseSpeed
	this.visualRange = 5
	this.attackRange = 1
	this.maxHp = Math.floor(Math.random() * 200) + 200
	this.hp = this.maxHp
	this.baseAttackValue = Math.floor(Math.random() * 100) + 10
	this.attackValue = this.baseAttackValue
	this.state = new CharacterState()
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.lastDirection = ""
	this.inventory = []
	var weapon = this.createWeapon()
	this.inventory.push(weapon)
	this.healthState = Utils.HEALTH_STATES.NORMAL
	this.beHealedIdx = 0
	this.healingIdx = 0
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
							L: "was killed by",
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
								L: "healing process was interupted by ",
								N2: messageContent.attacker,
								T: this.time,
							})
							soldierThis.healingIdx = 0
						}
						if (soldierThis.healthState <= Utils.HEALTH_STATES.HURT && soldierThis.healthState > Utils.HEALTH_STATES.INCAPACITATED){
							Logger.info({
								N1: soldierThis.charName,
								L: "was badly hurt, ran away from",
								N2: messageContent.attacker,
								T: time,
							})
							soldierThis.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(messageContent.attacker))
						} else {
							Logger.info({
								N1: soldierThis.charName,
								L: "was attacked, and fighted back",
								N2: messageContent.attacker,
								T: time,
							})
							soldierThis.state.setState(Utils.CHARACTER_STATES.CHASE, CharactersData.getCharacterByName(messageContent.attacker))
						}
						
					}

				} else if (messageContent.msgType.valueOf() == "heal".valueOf()){		
					if (soldierThis.beHealedIdx < Utils.HEAL_STEP) {
						soldierThis.beHealedIdx ++
						if (soldierThis.beHealedIdx >= Utils.HEAL_STEP) {
							soldierThis.hp = soldierThis.maxHp
							// soldierThis.beHealedIdx = 0
							Logger.info({
								N1: soldierThis.charName,
								L: "was healed by",
								N2: messageContent.healer,
								T: time,
							})
						}
						
					}
				}
			}
		}

		soldierThis.updateHealthStates(this.time)
		soldierThis.checkSurrounding(this.time)

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
				var isSuccessfulAttack = soldierThis.attack(this.time)

				if (isSuccessfulAttack[0]) {
					// notify the attacked character
					// state type maybe changed in the attack function
					if (soldierThis.state.stateType == Utils.CHARACTER_STATES.ATTACK){
						var atkValue = soldierThis.attackValue
						if (isSuccessfulAttack[1] != null) {
							atkValue = isSuccessfulAttack[1].value
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
				if (isSuccessfulHeal) {
					soldierThis.healingIdx++
					var msg = {
						msgType: "heal",
						healer: soldierThis.charName,
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
					"L": "was incapacitated, can't move anymore, need cure",
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
		L: "stayed in place",
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
		return false
	}

	var result = CharacterBase.hasMediKit(this.inventory)
	if (!result[0]) {
		this.state.setState(Utils.CHARACTER_STATES.WANDER, null)
		this.healingIdx = 0
		return false
	}

	CharacterBase.heal(this.healingIdx, this.charName, this.state.target.charName, result[1], this.inventory, time)
	return true
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

			availableDirections.push(tempDir)
		}
	}

	return availableDirections
}

Soldier.prototype.runAway = function(time){
	Logger.info({
		N1: this.charName,
		L: "ran away from",
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
				L: "recovered, and started to partrol",
				N2: "",
				T: time,
			})
			this.state.setState(Utils.CHARACTER_STATES.PATROL, null)
		} else {
			randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
			Logger.info({
				N1: this.charName,
				L: "recovered, and started to chase",
				N2: randomEnemy.charName,
				T: time,
			})
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomEnemy)
		}
		return
	}

	// run away succeed
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
	Logger.info({
		N1: this.charName,
		L: "was chasing",
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

Soldier.prototype.checkSurrounding = function(time){
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
				"L": "recovered, stopped running away from",
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
		if (this.state.stateType == Utils.CHARACTER_STATES.CHASE){
			if (!visibleEnemies.includes(this.state.target)){
				var randomVisibleCharacter = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)]
				this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
			}
		} else {
			var randomVisibleCharacter = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)]
			this.state.setState(Utils.CHARACTER_STATES.CHASE, randomVisibleCharacter)
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
				if (character.charType == Utils.CHARACTER_TYPE.ALIEN) {
					visibleEnemies.push(character)
				} else {
					visibleFriends.push(character)
				}
				
			}
	}
	
	return [visibleEnemies, visibleFriends]
}
module.exports = {
	Soldier,
}