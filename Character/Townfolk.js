
Character = require('./Character.js').Character
const utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')

var Townfolk = function(name, position){
	// jssim.SimEvent.call(this)
	this.charName = name
	this.position = position
	this.charType = utils.CHARACTER_TYPE[0]
	
}

Townfolk.prototype = Object.create(jssim.SimEvent)
Townfolk.prototype.update = function(deltaTime){
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
					if (this.charType == character.charType) {
						console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
					} else {
						switch (character.charType){
							case utils.CHARACTER_TYPE[0]:
								console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
								break
							case utils.CHARACTER_TYPE[1]:
								console.log(this.charName + '(' + this.charType + ') meet ' + character.charName + '(' + character.charType +')' + ' and then tried to run away')
								break
							case utils.CHARACTER_TYPE[2]:
								console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
								break
						}
						
					}
				}
		}
	}

	// var messages = this.prototype.readInBox();
    // for(var i = 0; i < messages.length; ++i){
    //     var msg = messages[i];
    //     var sender_id = msg.sender;
    //     var recipient_id = msg.recipient; // should equal to this.guid()
    //     var time = msg.time;
    //     var rank = msg.rank; // the messages[0] contains the highest ranked message and last messages contains lowest ranked
    //     var content = msg.content; // for example the "Hello" text from the sendMsg code above
	// 	console.log(sender_id + ' said ' + content + ' to ' + recipient_id)
	// }
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