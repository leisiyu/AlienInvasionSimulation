
class TownMap(){
	constructor(width, height){
		this.width = width;
		this.height = height; 
	}

	generatePos(){
		return [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]
	}
}