const utils = require('../Utils.js'); 

class TempMap{
    constructor(size){
        // linear map
        this.size = size
    }
    static getInstance() {
		if (!this.instance) {
			this.instance = new TempMap(utils.MAP_SIZE[0]);
		}
		return this.instance;
	}

    generateRandomPos(){
        return Math.floor(Math.random() * this.size)
    }
}

module.exports = {
    TempMap,
}