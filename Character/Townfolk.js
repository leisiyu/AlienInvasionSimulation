
Character = require('./Character.js').Character
const Utils = require('../Utils.js') 
const jssim = require('js-simulator')
const CharactersData = require('./CharactersData.js')
// const fs = require('node:fs')
const Logger = require('../Logger.js').Logger
const Map = require('../Map/TempMap.js').TempMap


var Townfolk = function(name, position){
	var townfolkThis = this
	// jssim.SimEvent.call(this, 10)
	this.charName = name
	this.position = position
	this.charType = Utils.CHARACTER_TYPE[0]
	this.simEvent = new jssim.SimEvent(10);
	this.simEvent.update = async function(deltaTime){
		
		townfolkThis.wander()
		if (CharactersData.charactersArray.length > 1){
			for(let i = 0; i < CharactersData.charactersArray.length; i++){
				var character = CharactersData.charactersArray[i]
				// Logger.info("name " + townfolkThis.charName + " " + townfolkThis.position + ' '+ character.charName + " " + character.position)
				if (townfolkThis != character && townfolkThis.position[0] == character.position[0] && townfolkThis.position[1] == character.position[1]){
					var msgContent 
					switch (character.charType){
						case Utils.CHARACTER_TYPE[0]:
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
							msgContent = {
								"character_name": townfolkThis.charName,
								// "character_type": townfolkThis.charType,
								// "act": "greeting",
								"log": "said hello to",
								"character2_name": character.charName,
								// "character2_type": character.charType,
								"time":this.time,
							}
							break
						case Utils.CHARACTER_TYPE[1]:
							// console.log(this.charName + '(' + this.charType + ') meet ' + character.charName + '(' + character.charType +')' + ' and then tried to run away')
							msgContent = {
								"character_name": townfolkThis.charName,
								// "character_type": townfolkThis.charType,
								// "act": "run away",
								"log": "met and then tried to run away from",
								"character2_name": character.charName,
								// "character2_type": character.charType,
								"time":this.time,
							}
							break
						case Utils.CHARACTER_TYPE[2]:
							// console.log(this.charName + '(' + this.charType + ') said hello to ' + character.charName + '(' + character.charType +')')
							msgContent = {
								"character_name": townfolkThis.charName,
								// "character_type": townfolkThis.charType,
								// "act": "greeting",
								"log": "said hello to",
								"character2_name": character.charName,
								// "character2_type": character.charType,
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

				// Utils.logger.debug(content)
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

// step length == 1
Townfolk.prototype.wander = function(){
	var directions = ['left', 'right', 'up', 'down']
	var direction = directions[Math.floor(Math.random() * directions.length)]

	var newPosition = [Number(JSON.stringify(this.position[0])), Number(JSON.stringify(this.position[1]))]
	switch(direction){
		case 'left':
			newPosition[0] = newPosition[0] - 1 < 0 ? newPosition[0] : newPosition[0] - 1
			break;
		case 'right':
			newPosition[0] = newPosition[0] + 1 >= Utils.MAP_SIZE[0] ? newPosition[0] : newPosition[0] + 1
			break
		case 'up':
			newPosition[1] = newPosition[1] - 1 < 0 ? newPosition[1] : newPosition[1] - 1
			break
		case 'down':
			newPosition[1] = newPosition[1] + 1 >= Utils.MAP_SIZE[1] ? newPosition[1] : newPosition[1] + 1
			break
	}

	// check the new position
	var isOldPositionInBuilding = Map.getInstance().checkIsInABuilding(this.position)
	var isNewPositionInBuilding = Map.getInstance().checkIsInABuilding(newPosition)

	// old and new positions are in different buildings
	if (isOldPositionInBuilding[0] && isNewPositionInBuilding[0] && isOldPositionInBuilding[1] != isNewPositionInBuilding[1]){
		var oldBuilding = Map.getInstance().getBuilding(isOldPositionInBuilding[1])
		// check if accessible
		if (!oldBuilding.checkPosAccessible(newPosition)) {
			return 
		}
	}
	// old is in a building; new is not in a building
	if (isOldPositionInBuilding[0] && !isNewPositionInBuilding[0]) {
		var oldBuilding = Map.getInstance().getBuilding(isOldPositionInBuilding[1])
		// check if accessible
		if (!oldBuilding.checkPosAccessible(newPosition)) {
			return 
		}
	}
	// old is not in a building; new is in a building
	if (!isOldPositionInBuilding[0] && isNewPositionInBuilding[0]) {
		var newBuilding = Map.getInstance().getBuilding(isNewPositionInBuilding[1])
		// check if accessible
		if (!newBuilding.checkPosAccessible(this.position)) {
			return 
		}
	}

	//////////////
	//////log
	// if (isOldPositionInBuilding[0]) {
	// 	console.log(this.charName + " was in building " + isOldPositionInBuilding[1])
	// }
	// console.log(this.charName + "(" + isOldPositionInBuilding + ")" + " moved to " + newPosition)
	// if (isNewPositionInBuilding[0]) {
	// 	console.log(this.charName + "is in building " + isNewPositionInBuilding[1] + " now")
	// }
	/////////////
	
	this.position = newPosition
}

module.exports = {
	Townfolk,
}