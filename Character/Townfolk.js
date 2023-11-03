
Character = require('./Character.js').Character
const utils = require('../Utils.js') 

class Townfolk extends Character{
	constructor(name, position) {
		super(name, position);
	}

	walk(direction){
		switch (direction) {
			case utils.DIRECTION[0]:
				this.position[1] = this.position[1] + 1 >= utils.MAP_SIZE[1] ? this.position[1] : this.position[1] + 1;
			case utils.DIRECTION[1]:
				this.position[1] = this.position[1] - 1 < 0 ? this.position[1] : this.position[1] - 1;
			case utils.DIRECTION[2]:
				this.position[0] = this.position[0] - 1 < 0 ? this.position[0] : this.position[0] - 1;
			case utils.DIRECTION[3]:
				this.position[0] = this.position[0] + 1 >= utils.MAP_SIZE[0] ? this.position[0] : this.position[0] + 1;
		}
	}

	walkWithRandomDirection(){
		var randomDir = utils.DIRECTION[Math.floor(Math.random() * utils.DIRECTION.length)];
		this.walk(randomDir)
		console.log(this.name + " position " + this.position);
	}
}

module.exports = {
	Townfolk,
}