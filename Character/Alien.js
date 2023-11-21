
Character = require('./Character.js').Character
const utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')

var Alien = function(name, position){
	// jssim.SimEvent.call(this)
	this.charName = name
	this.position = position
	this.charType = utils.CHARACTER_TYPE[1]
	
}

Alien.prototype = Object.create(jssim.SimEvent)
Alien.prototype.update = function(deltaTime){
	var directions = ['left', 'right']
	var tempDirection = directions[Math.floor(Math.random() * directions.length)]
	this.tempWalk(tempDirection)
	console.log(this.charName + ' goes to ' + this.position)

	if (CharactersData.charactersArray.length > 0) {
		for (let i = 0; i< CharactersData.charactersArray.length; i++){
			var character = CharactersData.charactersArray[i]
			if (this != character && this.position == character.position){
					// var receiverId = character.prototype.guid()
					// console.log(receiverId)
					// this.prototype.sendMsg(character, {
					// 	content: 'Hello'
					// })
					if (this.charType != character.charType){
						console.log(this.charName + '(' + this.charType + ') attacked ' + character.charName + '(' +character.charType + ')')
					} else {
						console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' +character.charType + ')')
					}
					
				}
		}
	}
}

Alien.prototype.tempWalk = function(direction){
	switch(direction){
		case 'left':
			this.position = this.position - 1 < 0 ? this.position : this.position - 1
			break;
		case 'right':
			this.position = this.position + 1 >= 10 ? this.position : this.position + 1
			break
	}
}

module.exports = {
	Alien,
}