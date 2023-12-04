const Utils = require('../Utils.js')
const MapUtil = require("./MapUtil.js")
const Building = require('./Building.js').Building

class TempMap{
    constructor(size){
        // linear map
        this.size = size
        this.buildings = []

        // for checking overlap
        this.map = [];
		for (var i = 0; i < this.size[0]; i++){
			this.map[i] = [];
			for (var j = 0; j < this.size[1]; j++){
				this.map[i].push(0)
			}
		}
    }
    static getInstance() {
		if (!this.instance) {
			this.instance = new TempMap(Utils.MAP_SIZE);
		}
		return this.instance;
	}

    createRandomRoom(){
		var x = Math.floor(Math.random() * (this.size[0] - MapUtil.MAX_BUILDING_SIZE))
		var y = Math.floor(Math.random() *(this.size[1] - MapUtil.MAX_BUILDING_SIZE))
		var w = Math.ceil(Math.random() * (MapUtil.MAX_BUILDING_SIZE - MapUtil.MIN_BUILDING_SIZE)) + MapUtil.MIN_BUILDING_SIZE
		var h = Math.ceil(Math.random() * (MapUtil.MAX_BUILDING_SIZE - MapUtil.MIN_BUILDING_SIZE)) + MapUtil.MIN_BUILDING_SIZE
		var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]

		var building = new Building([w,h], [x,y], buildingType)
        if (this.isValid(building)){
            this.buildings.push(building)
            this.fillMap(building)
        }
		return building
	}

    isValid(building){
		var x = building.position[0]
		var y = building.position[1]
		var w = building.size[0]
		var h = building.size[1]

		if (x < 0 || x + w >= this.size[0]) { return false }
		if (y < 0 || y + h >= this.size[1]) { return false }

		// overlapping check
		for (var i = x; i < x + w; i++){
			for (var j = y; j < y + h; j++){
				// if (this.map[i] && this.map[i][j] === 1) { return false }
				if (this.map[i][j] == 1) { return false }
			}
		}

		return true
	}

    fillMap(building){
		for (var i = building.position[0]; i <= building.position[0] + building.size[0]; i++){
			for (var j = building.position[1]; j <= building.position[1] + building.size[1]; j++)
				this.map[i][j] = 1
		}
	}

    createRandomMap(){
        for (let i = 0; i < 4; i++){
            this.createRandomRoom()
        }
		

        ////draw a map
        for (var i = 0; i < this.size[0]; i++){
			console.log(JSON.stringify(this.map[i]))
			debugger
		}
	}

    generateRandomPos(){
        return [Math.floor(Math.random() * this.size[0]), Math.floor(Math.random() * this.size[1])]
    }

	checkIsInABuilding(position){
		for (let i = 0; i < this.buildings.length; i++){
			if (this.buildings[i].checkIfInThisBuilding(position)){
				return true, i
			}
		}
		return false
	}
}

module.exports = {
    TempMap,
}