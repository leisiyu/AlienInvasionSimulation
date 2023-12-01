
Character = require('./Character.js').Character
const utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger


var Townfolk = function(name, position){
	var townfolkThis = this
	// jssim.SimEvent.call(this, 10)
	this.charName = name
	this.position = position
	this.charType = utils.CHARACTER_TYPE[0]
	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = async function(deltaTime){
		var directions = ['left', 'right']
		var tempDirection = directions[Math.floor(Math.random() * directions.length)]
		townfolkThis.tempWalk(tempDirection)
		if (CharactersData.charactersArray.length > 1){
			for(let i = 0; i < CharactersData.charactersArray.length; i++){
				var character = CharactersData.charactersArray[i]
				// console.log(townfolkThis.position + ' ' + character.position)
				if (townfolkThis != character && townfolkThis.position == character.position){
					var msgContent 
					
					switch (character.charType){
						case utils.CHARACTER_TYPE[0]:
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
							msgContent = {
								"character_name": townfolkThis.charName,
								"character_type": townfolkThis.charType,
								"act": "greeting",
								"log": "{0} said hello to {1}",
								"character2_name": character.charName,
								"character2_type": character.charType,
								"time":this.time,
							}
							break
						case utils.CHARACTER_TYPE[1]:
							// console.log(this.charName + '(' + this.charType + ') meet ' + character.charName + '(' + character.charType +')' + ' and then tried to run away')
							msgContent = {
								"character_name": townfolkThis.charName,
								"character_type": townfolkThis.charType,
								"act": "run away",
								"log": "{0} meet {1}, and then tried to run away",
								"character2_name": character.charName,
								"character2_type": character.charType,
								"time":this.time,
							}
							break
						case utils.CHARACTER_TYPE[2]:
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
							msgContent = {
								"character_name": townfolkThis.charName,
								"character_type": townfolkThis.charType,
								"act": "greeting",
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
				// await fs.appendFile('../Log.txt', "content", (err) => { 
				// 	// In case of a error throw err. 
				// 	if (err) throw err; 
				// 	console.log('success!')
				// }) 
				// fs.writeFileSync('../Log.txt', "content")

				// utils.logger.debug(content)
				Logger.info(content)
			}
		}
	}
}


Townfolk.prototype.tempWalk = function(direction){
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
	Townfolk,
}