const utils = require('../Utils.js') 

class Character{
	constructor(name, position){
		this.name = name;
		this.position = position;
		// this.inventorySize = inventorySize;
		this.inventory = [];
		this.hp = Math.floor(Math.random() * 100);
		this.attack = Math.floor(Math.random() * 10);
	}

	walk(direction){
		switch (direction) {
			case utils.DIRECTION[0]:
				this.position[1] = this.position[1] + 1 >= utils.MAP_SIZE[1] ? this.position[1] : this.position[1] + 1;
				break;
			case utils.DIRECTION[1]:
				this.position[1] = this.position[1] - 1 < 0 ? this.position[1] : this.position[1] - 1;
				break;
			case utils.DIRECTION[2]:
				this.position[0] = this.position[0] - 1 < 0 ? this.position[0] : this.position[0] - 1;
				break;
			case utils.DIRECTION[3]:
				this.position[0] = this.position[0] + 1 >= utils.MAP_SIZE[0] ? this.position[0] : this.position[0] + 1;
				break;
		}
	}

	walkWithRandomDirection(){
		var randomDir = utils.DIRECTION[Math.floor(Math.random() * utils.DIRECTION.length)];
		
		this.walk(randomDir)
		// console.log("lalalala" + randomDir + this.position);
		// console.log(this.name + " position " + this.position);
	}

	run(){

	}

	speak(){

	}

	attack(character){
		console.log(this.name + " attack " + character.name);
	}

	pickUp(){

	}

	knowledge(){
		
	}

}

module.exports = {
	Character,
}