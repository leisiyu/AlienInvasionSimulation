const utils = require('../Utils.js') 

class TownMap{
	constructor(mapSize){
		this.width = mapSize[0];
		this.height = mapSize[1]; 

		this.map = [];
		for (let i = 0; i < this.width; i++){
			this.map[i] = [];
			for (let j = 0; j < this.height; j++){
				this.map[i][j] = [];
			}
		}
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new TownMap(utils.MAP_SIZE);
		}
		return this.instance;
	}

	generateRandomPos(){
		return [Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)]
	}

	getSize(){
		return [this.width, this.height];
	}

	updateObjectsOnTheMap(){

	}

	updateObjectOnTheMap(object, oldPosition, newPosition){
		if (oldPosition.length > 0){
			var objectArray = self.map[oldPosition[0]][oldPosition[1]];
			if (objectArray.indexOf(object) != -1) {
				objectArray.slice(objectArray.indexOf(object), objectArray.indexOf(object));
			}
		}
		
		this.map[newPosition[0]][newPosition[1]].push(object);
	}

}

module.exports = {
	TownMap,
}