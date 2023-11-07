
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
}

module.exports = {
	Townfolk,
}