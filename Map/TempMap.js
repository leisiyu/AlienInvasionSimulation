const Utils = require('../Utils.js')
const MapUtil = require("./MapUtil.js")
const Building = require('./Building.js').Building
const RoadManager = require('./RoadManager')
const fs = require('node:fs')

class TempMap{
    constructor(size){
        // linear map
        this.size = size
        this.buildings = []
		this.roads = []

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

    createRandomBuilding(){
		var x = Math.floor(Math.random() * (this.size[0] - MapUtil.MAX_BUILDING_SIZE))
		var y = Math.floor(Math.random() *(this.size[1] - MapUtil.MAX_BUILDING_SIZE))
		var w = Math.ceil(Math.random() * (MapUtil.MAX_BUILDING_SIZE - MapUtil.MIN_BUILDING_SIZE)) + MapUtil.MIN_BUILDING_SIZE
		var h = Math.ceil(Math.random() * (MapUtil.MAX_BUILDING_SIZE - MapUtil.MIN_BUILDING_SIZE)) + MapUtil.MIN_BUILDING_SIZE
		var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]

		var building = new Building([w,h], [x,y], buildingType, [])
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

    fillMap(building, idx){
		for (var j = building.position[1]; j < building.position[1] + building.size[1]; j++){
			for (var i = building.position[0]; i < building.position[0] + building.size[0]; i++){
				// this.map[i][j] = 1
				this.map[i][j] = idx
			}
		}
	}

    createRandomMap(){
		/////random buildings
        // for (let i = 0; i < 4; i++){
        //     this.createRandomBuilding()
        // }

		//////random roads
		this.roads = RoadManager.generateRoads([Utils.MAP_SIZE[0] / 2, Utils.MAP_SIZE[1] / 2])
		// console.log('road num ' + this.roads.length)
		for (let i = 0; i < this.roads.length; i++){
			// console.log(this.roads[i].position + '  '+ this.roads[i].size)
			this.fillMap(this.roads[i], 'r')
		}
		

        ////draw a map
        for (var i = 0; i < this.size[0]; i++){
			console.log(JSON.stringify(this.map[i]))
			// debugger
		}

		////output map data
		fs.writeFileSync('./CityMap.txt', JSON.stringify(this.map), (err) => { 
			// In case of a error throw err. 
			if (err) throw err;
			else {
				console.log('successful')
				Logger.clearQueue()
			}
		}) 
	}

    generateRandomPos(){
        return [Math.floor(Math.random() * this.size[0]), Math.floor(Math.random() * this.size[1])]
    }

	checkIsInABuilding(position){
		for (let i = 0; i < this.buildings.length; i++){
			if (this.buildings[i].checkIsInThisBuilding(position)){
				return [true, i]
			}
		}
		return [false]
	}

	getBuilding(idx){
		return this.buildings[idx]
	}
}

module.exports = {
    TempMap,
}