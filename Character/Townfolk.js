
Character = require('./Character.js').Character
const utils = require('../Utils.js') 

class Townfolk extends Character{
	constructor(name, position) {
		super(name, position);
		this.charType = utils.CHARACTER_TYPE[0];
	}

	walk(direction){
		super.walk(direction);
	}

	walkWithRandomDirection(){
		super.walkWithRandomDirection();
	}

	speak(character){
		super.speak(character);
	}

	attack(character){
		super.attack(character);
	}

	tempWalk(direction){
		switch(direction){
			case 'left':
				this.position = this.position - 1 < 0 ? this.position : this.position - 1
				break;
			case 'right':
				this.position = this.position + 1 >= 10 ? this.position : this.position + 1
				break
		}
	}

	meet(character){
		var receiver_id = character.guid()
    	this.sendMsg(receiver_id, {
        	content: "Hello"
    	});
	}
}

module.exports = {
	Townfolk,
}