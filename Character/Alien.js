
Character = require('./Character.js').Character
const utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('fs')
const Logger = require('../Logger.js').Logger

var Alien = function(name, position){
	// jssim.SimEvent.call(this)
	this.charName = name
	this.position = position
	this.charType = utils.CHARACTER_TYPE[1]
	var alienThis = this
	this.simEvent = new jssim.SimEvent(10)
	this.simEvent.update = function(deltaTime){
		alienThis.wander()
		// console.log(this.charName + ' goes to ' + this.position)

		if (CharactersData.charactersArray.length > 0) {
			for (let i = 0; i< CharactersData.charactersArray.length; i++){
				var character = CharactersData.charactersArray[i]
				if (alienThis != character && alienThis.position[0] == character.position[0] && alienThis.position[1] == character.position[1]){
						
						var msgContent
						if (alienThis.charType != character.charType){
							// console.log(this.charName + '(' + this.charType + ') attacked ' + character.charName + '(' +character.charType + ')')
							msgContent = {
								"character_name": alienThis.charName,
								// "character_type": alienThis.charType,
								// "action": "attack",
								"log": "attacked",
								"character2_name": character.charName,
								// "character2_type": character.charType,
								"time":this.time,
							}
						} else {
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' +character.charType + ')')
							msgContent = {
								"character_name": alienThis.charName,
								// "character_type": alienThis.charType,
								// "act": "greet",
								"log": "said hello to",
								"character2_name": character.charName,
								// "character2_type": character.charType,
								"time":this.time,
							}
						}

						this.sendMsg(character.simEvent.guid(), {
							content: JSON.stringify(msgContent)
						})
					}
			}
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
				// console.log("content: " + content)
				// fs.appendFile('../Log.txt', content, (err) => { 
					// In case of a error throw err. 
					// if (err) throw err;
					// else {
					// 	console.log('successful')
					// }
				// }) 
					// utils.logger.debug(content)
				Logger.info(content)
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

// step length == 1
Alien.prototype.wander = function(){
	var directions = ['left', 'right', 'up', 'down']
	var direction = directions[Math.floor(Math.random() * directions.length)]

	switch(direction){
		case 'left':
			this.position[0] = this.position[0] - 1 < 0 ? this.position[0] : this.position[0] - 1
			break;
		case 'right':
			this.position[0] = this.position[0] + 1 >= utils.MAP_SIZE[0] ? this.position[0] : this.position[0] + 1
			break
		case 'up':
			this.position[1] = this.position[1] - 1 < 0 ? this.position[1] : this.position[1] - 1
			break
		case 'down':
			this.position[1] = this.position[1] + 1 >= utils.MAP_SIZE[1] ? this.position[1] : this.position[1] + 1
			break
	}
}

module.exports = {
	Alien,
}