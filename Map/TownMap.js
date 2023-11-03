
class TownMap{
	constructor(mapSize){
		this.width = mapSize[0];
		this.height = mapSize[1]; 
	}

	static getInstance(mapSize) {
		if (!this.instance) {
			this.instance = new TownMap(mapSize);
		}
		return this.instance;
	}

	generateRandomPos(){
		return [Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)]
	}

	getSize(){
		return [this.width, this.height];
	}
}

module.exports = {
	TownMap,
}