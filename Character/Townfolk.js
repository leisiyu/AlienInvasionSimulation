
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
const ORDER_TYPE = require('../DramaManager/Order.js').ORDER_TYPE


var Townfolk = function(name, position){
	var townfolkThis = this
	// jssim.SimEvent.call(this, 10)
	this.charName = name
	this.position = position
	this.objType = Utils.CHARACTER_TYPE.TOWNSFOLK
	this.baseSpeed = Math.floor(Math.random() * 3) + 1
	this.speed = this.baseSpeed
	// this.speed = 10 // test
	this.visualRange = Math.floor(Math.random() * 3) + 3
	this.attackRange = Math.floor(Math.random() * 2) + 1
	this.attackValue = 10
	this.criticalHitProbability = new Probability(Utils.ATTACK_TYPE, [95, 5])
	this.maxHp = Math.floor(Math.random() * 200) + 50
	this.hp = this.maxHp
	this.hideProbability = new Probability([Utils.CHARACTER_STATES.WANDER, Utils.CHARACTER_STATES.HIDE], [30, 70])
	this.directionProbability = new Probability(Utils.DIRECTION, [10, 10, 10, 10])
	this.lastDirection = ""
	this.inventory = []
	this.beHealedIdx = 0
	this.healingIdx = 0
	this.state = new CharacterState(Utils.CHARACTER_STATES.WANDER)
	this.orders = []
	this.order = null

	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = async function(deltaTime){

		
		// if character died
		if (townfolkThis.state.stateType == Utils.CHARACTER_STATES.DIED) { return }

		townfolkThis.updateHealthStates(this.time)

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
				}else if (messageContent.msgType.valueOf() == "heal".valueOf()){
					if (townfolkThis.beHealedIdx < Utils.HEAL_STEP) {
						townfolkThis.beHealedIdx ++
						townfolkThis.hp = townfolkThis.hp + messageContent.value 
						if (townfolkThis.hp > townfolkThis.maxHp) {
							townfolkThis.hp = townfolkThis.maxHp
							townfolkThis.beHealedIdx = Utils.HEAL_STEP
						}
						if (townfolkThis.beHealedIdx >= Utils.HEAL_STEP) {
							// townfolkThis.hp = townfolkThis.maxHp
							townfolkThis.beHealedIdx = 0
							Logger.info({
								N1: townfolkThis.charName,
								L: "is healed by",
								N2: messageContent.healer,
								T: time,
							})
						}
					}
					
				}
			}
		}
		// check the character's state
		townfolkThis.updateStates(time)
		// if (townfolkThis.order != null && Utils.NEUTRAL_STATES.includes(townfolkThis.state.stateType)) {
		if (townfolkThis.orders.length != 0){
			// console.log("hahaha   townsfolk order" + " " + townfolkThis.charName + " " + townfolkThis.order.orderType + this.time)
			townfolkThis.order = CharacterBase.chooseOrderWithHighestPriority(townfolkThis.orders)
			townfolkThis.order.excute()
			switch(townfolkThis.order.orderType){
				case ORDER_TYPE.MOVE:
					
					break
				case ORDER_TYPE.ATTACK:
					var isSuccessfulAttack = townfolkThis.orderAttack(this.time)

					if (isSuccessfulAttack) {
						// notify the attacked character
						// state type maybe changed in the attack function
						var attackType = townfolkThis.criticalHitProbability.randomlyPick()
						var attackRatio = attackType == Utils.ATTACK_TYPE[0] ? 1 : Utils.CRITICAL_HIT
						var msg = {
							msgType: "attacked",
							atkValue: Math.floor(townfolkThis.attackValue * attackRatio),
							attacker: townfolkThis.charName,
						}
						this.sendMsg(townfolkThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					
					}
					break
				case ORDER_TYPE.CHASE:
					var isSuccessfullyChase = townfolkThis.orderChase(this.time)
					
					break
				case ORDER_TYPE.HEAL:
					var isSuccessfullyHeal = townfolkThis.orderHeal(this.time)
					if (isSuccessfullyHeal[0]) {
						townfolkThis.healingIdx++
						var msg = {
							msgType: "heal",
							healer: townfolkThis.charName,
							value: isSuccessfullyHeal[1],
						}
						this.sendMsg(townfolkThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					} 
					break
				case ORDER_TYPE.KILL:
					var isSuccessfulAttack = townfolkThis.orderAttack(this.time)

					if (isSuccessfulAttack) {
						// notify the attacked character
						// state type maybe changed in the attack function
						var msg = {
							msgType: "attacked",
							atkValue: Math.floor(townfolkThis.attackValue * Utils.CRITICAL_HIT),
							attacker: townfolkThis.charName,
						}
						this.sendMsg(townfolkThis.order.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					
					}
					break
				case ORDER_TYPE.RUN_AWAY:
					townfolkThis.orderRunAway(this.time)
					break
			}
		} else {
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
						var attackType = townfolkThis.criticalHitProbability.randomlyPick()
						var attackRatio = attackType == Utils.ATTACK_TYPE[0] ? 1 : Utils.CRITICAL_HIT
						var atkValue = 0
						if (isSuccessfulAttack[1] != null) {
							atkValue = Math.floor(isSuccessfulAttack[1].value * attackRatio)
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
					townfolkThis.chase(this.time)
					break
				case Utils.CHARACTER_STATES.HEAL:
					var isSuccessfulHeal = townfolkThis.heal(this.time)
					if (isSuccessfulHeal[0]) {
						townfolkThis.healingIdx++
						var msg = {
							msgType: "heal",
							healer: townfolkThis.charName,
							value: isSuccessfulHeal[1],
						}
						this.sendMsg(townfolkThis.state.target.simEvent.guid(), {
							content: JSON.stringify(msg)
						})
					} else {
						townfolkThis.state.setState(Utils.CHARACTER_STATES.PATROL, null)
					}
					break
				case Utils.CHARACTER_STATES.DIED:
					break
	
			}
		}
		

		CharacterBase.checkOrder(townfolkThis)
	}
}

Townfolk.prototype.updateHealthStates = function(time){
	var newState = CharacterBase.updateHealthState(this.hp, this.maxHp)
	switch(newState){
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
			break
		case Utils.HEALTH_STATES.INCAPACITATED:
			Logger.info({
				"N1": this.charName,
				"L": "is incapacitated, can't move anymore, need cure",
				"N2": "",
				"T": time,
			})
			this.speed = 0
			if (this.hp > 0) {
				this.hp = this.hp - 5
			}
			this.attackValue = Math.floor(this.baseAttackValue * 0.4)

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
			}
			
			break
		case Utils.HEALTH_STATES.DIED:
			this.speed = 0
			this.hp = 0
			this.state.setState(Utils.CHARACTER_STATES.DIED, null)
	}

	this.healthState = newState
}

Townfolk.prototype.getAttacked = function(time, attacker, atkValue){

	if (this.hp <= 0) {
		this.state.setState(Utils.CHARACTER_STATES.DIED, null)
		return
	}
	this.hp = this.hp - atkValue

	Logger.info({
		N1: this.charName,
		L: "is attacked by",
		N2: attacker,
		T: time,
	})

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
			L: "is killed by",
			N2: attacker,
			T: time,
		})
		CharacterBase.dropInventory(this.inventory, this.position)
		return
	} else {
		if (this.state.stateType == Utils.CHARACTER_STATES.HEAL){
			Logger.info({
				N1: this.charName,
				L: "healing process is interupted by ",
				N2: attacker,
				T: this.time,
			})
			this.healingIdx = 0
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(attacker))

		}
		if (this.healthState <= Utils.HEALTH_STATES.HURT && this.healthState > Utils.HEALTH_STATES.INCAPACITATED){
			Logger.info({
				N1: this.charName,
				L: "is badly hurt, runs away from",
				N2: attacker,
				T: time,
			})
			this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(attacker))
			return
		} else {
			if (this.hasWeapon()) {
				this.state.setState(Utils.CHARACTER_STATES.ATTACK, CharactersData.getCharacterByName(attacker))
				return	
			} else {
				Logger.info({
					N1: this.charName,
					L: "runs away from",
					N2: attacker,
					T: this.time,
				})
				this.state.setState(Utils.CHARACTER_STATES.RUN_AWAY, CharactersData.getCharacterByName(attacker))
			}
		}
	}
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
				L: "is hiding in",
				N2: "building" + isInBuilding[1],
				T: time,
			})
		}
		
	} else {
		this.state.setState(newState, null)
		this.wander(time)

		Logger.info({
			N1: this.charName,
			L: "is wandering around",
			N2: "",
			T: time,
		})
	}
}


// if there's a enemy, then runAway
// if has weapon, attack or chase
// change state only
Townfolk.prototype.updateStates = function(time){

	if (this.hp <= 0) {
		this.state.setState(Utils.CHARACTER_STATES.DIED, null)
		return
	}

	var isInBuilding = MapManager.checkIsInABuilding(this.position)
	
	if (isInBuilding[0]) {
		if (this.hasWeapon()) {
			 this.state.setState(Utils.CHARACTER_STATES.WANDER, null)
		} else {
			var newState = this.hideProbability.randomlyPick()
			this.state.setState(newState, null)
		}
		return
	} else {
		if (this.state.stateType == Utils.CHARACTER_STATES.HEAL) {

			if (this.state.target.beHealedIdx < Utils.HEAL_STEP && this.healingIdx < Utils.HEAL_STEP) {
				// stay in the healing or be healed state
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
		var enemies = this.checkVisualRange()[0]
		if (enemies.length > 0) {
			if (this.hasWeapon()) {
				var enemy = enemies[Math.floor(Math.random() * enemies.length)]
				if (this.state.target != null) {
					enemy = this.state.target
				} 

				var enemyPos = enemy.position
				// if (Math.abs(this.position[0] - enemyPos[0]) + Math.abs(this.position[1] - enemyPos[1]) <= this.attackRange) {
					if (CharacterBase.calDistanceOfCharacters(this, enemy) <= this.attackRange) {
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
	}
	this.state.setState(Utils.CHARACTER_STATES.WANDER, null)
		return 
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
		L: "runs away from",
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

	// run away succeed
	// TO DO
	var enemiesNearby = this.checkVisualRange()[0]
	if (enemiesNearby.indexOf(this.state.target) == -1) {
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

Townfolk.prototype.getRunAwayDirection = function(){
	var oppositDir = CharacterBase.getAwayTargetDirection(this.objType, this.position, this.state.target)
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

}

Townfolk.prototype.getAvailableDirectionsForPatrol = function(){
	
	var availableDirections = CharacterBase.getAvailableDirectionsForPatrol(this.position, this.objType)

	return availableDirections
}

Townfolk.prototype.checkVisualRange = function(){
	var startX = this.position[0] - this.visualRange < 0 ? 0 : this.position[0] - this.visualRange
	var endX = this.position[0] + this.visualRange >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : this.position[0] + this.visualRange
	var startY = this.position[1] - this.visualRange < 0 ? 0 : this.position[1] - this.visualRange
	var endY = this.position[1] + this.visualRange >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : this.position[1] + this.visualRange

	var visibleEnemies = []
	var visibleAllies = []
	for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		var characterPos = character.position
		if (characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.state.stateType != Utils.CHARACTER_STATES.DIED) {
				if (character.objType == Utils.CHARACTER_TYPE.ALIEN) {
					visibleEnemies.push(character)
				} else {
					visibleAllies.push(character)
				}
				
			}
	}
	
	return [visibleEnemies, visibleAllies]
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

	return result
}

Townfolk.prototype.chase = function(time){
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

Townfolk.prototype.heal = function(time) {
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

	Logger.statesInfo(JSON.stringify({
		N: this.charName,
		S: this.state.stateType,
		P: this.position,
		T: time,
	}))

	CharacterBase.heal(this.healingIdx, this.charName, this.state.target.charName, result[1], this.inventory, time)
	// console.log("hahahahah  " + result[1].durability)
	return [true, result[1].value]
}

//-----------order start -------------
Townfolk.prototype.orderAttack = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	if (this.hasWeapon()) {
		var result = CharacterBase.orderAttack(this, time)
		return result
	} else {
		// this.orderFindAWeapon(time)
		CharacterBase.orderFindAWeapon(this, time)
		return false
	}
}

// Townfolk.prototype.orderFindAWeapon = function(time){
// 	console.log("Order: go and find a weapon")
// }

Townfolk.prototype.orderChase = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	var result = CharacterBase.orderChase(this, time)

	return result
}

Townfolk.prototype.orderHeal = function(time){
	CharacterBase.executeOrderBase(this.charName, this.order, time)

	var result = CharacterBase.orderHeal(this, time)
	return result
}

Townfolk.prototype.orderRunAway = function(time){
	var result = CharacterBase.orderRunAway(this, this.order.target, time)

	if (result) {
		CharacterBase.executeOrderBase(this.charName, this.order, time)
	}
}
//-----------order end ---------------

module.exports = {
	Townfolk,
}