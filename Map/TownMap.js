
class TownMap{
	constructor(width, height){
		this.width = width;
		this.height = height; 
	}

	static getInstance(width, height) {
		if (!this.instance) {
			this.instance = new TownMap(width, height);
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