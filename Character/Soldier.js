
Character = require('./Character.js').Character
const utils = require('../Utils.js') 

class Soldier extends Character{
	constructor(name, position) {
		super(name, position);
		this.charType = utils.CHARACTER_TYPE[2];
	}

	// walk(direction){
	// 	super.walk(direction);
	// }

	// walkWithRandomDirection(){
	// 	super.walkWithRandomDirection()
	// }
}

module.exports = {
	Soldier,
}