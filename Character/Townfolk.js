
Character = require('./Character.js').Character
const utils = require('../Utils.js') 

class Townfolk extends Character{
	constructor(name, position) {
		super(name, position);
	}

	walk(direction){
		super.walk(direction);
	}

	walkWithRandomDirection(){
		super.walkWithRandomDirection();
	}
}

module.exports = {
	Townfolk,
}