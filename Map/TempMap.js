const utils = require('../Utils.js'); 

class TempMap{
    constructor(size){
        // linear map
        this.size = size
    }
    static getInstance() {
		if (!this.instance) {
			this.instance = new TempMap(utils.MAP_SIZE);
		}
		return this.instance;
	}

    

    generateRandomPos(){
        return [Math.floor(Math.random() * this.size[0]), Math.floor(Math.random() * this.size[1])]
    }
}

module.exports = {
    TempMap,
}