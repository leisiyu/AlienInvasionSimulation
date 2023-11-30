
Character = require('./Character.js').Character
const utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
const fs = require('node:fs')

var Soldier = function(name, position){
	// jssim.SimEvent.call(this, 20)
	this.charName = name
	this.position = position
	this.charType = utils.CHARACTER_TYPE[2]
	var soldierThis = this

	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = function(deltaTime){
		var directions = ['left', 'right']
		var tempDirection = directions[Math.floor(Math.random() * directions.length)]
		soldierThis.tempWalk(tempDirection)
		// console.log(this.charName + ' goes to ' + this.position)

		if (CharactersData.charactersArray.length > 0) {
			for (let i = 0; i< CharactersData.charactersArray.length; i++){
				var character = CharactersData.charactersArray[i]
				if (soldierThis != character && soldierThis.position == character.position){
						
						var msgContent 
						switch (character.charType){
							case utils.CHARACTER_TYPE[0]:
								// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' +character.charType + ')')
								msgContent = {
									"character_name": soldierThis.charName,
									"character_type": soldierThis.charType,
									"act": "greet",
									"log": "{0} said hello to {1}",
									"character2_name": character.charName,
									"character2_type": character.charType,
									"time":this.time,
								}
								break
							case utils.CHARACTER_TYPE[1]:
								// console.log(this.charName + '(' + this.charType + ') attacked ' + character.charName + '(' + character.charType +')')
								msgContent = {
									"character_name": soldierThis.charName,
									"character_type": soldierThis.charType,
									"action": "attack",
									"log": "{0} attacked {1}",
									"character2_name": character.charName,
									"character2_type": character.charType,
									"time":this.time,
								}
								break
							case utils.CHARACTER_TYPE[2]:
								// console.log(this.charName  + '(' + this.charType + ') said hello to ' + character.charName+ '(' + character.charType +')')
								msgContent = {
									"character_name": soldierThis.charName,
									"character_type": soldierThis.charType,
									"act": "greet",
									"log": "{0} said hello to {1}",
									"character2_name": character.charName,
									"character2_type": character.charType,
									"time":this.time,
								}
								break
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
				// 	// In case of a error throw err. 
				// 	if (err) throw err; 
				// }) 
				utils.logger.debug(content)
			}
		}
	}
}

Soldier.prototype.tempWalk = function(direction){
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
	Soldier,
}