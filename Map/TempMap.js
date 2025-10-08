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
				if (this.map[i][j] != 0) { return false }
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
		// Lazy require to avoid circular dependency during module initialization
		const Logger = require('../Logger.js').Logger
		//////random roads
		this.roads = RoadManager.generateRoads([Math.floor(Utils.MAP_SIZE[0] / 2), Math.floor(Utils.MAP_SIZE[1] / 2)])
		for (let i = 0; i < this.roads.length; i++){
			this.fillMap(this.roads[i], 'r')
		}
		
		this.generateBuildings()
		var tempBuildings = []
		for (let i = 0; i < this.buildings.length; i++){
			// if (this.isValid(this.buildings[i])){
				this.fillMap(this.buildings[i], 'b' + i)
				// tempBuildings.push(this.buildings[i])
			// }			
		}

        ////draw a map
        for (var i = 0; i < this.size[0]; i++){
			console.log(JSON.stringify(this.map[i]))
			// debugger
		}

		////output map data
		var dirName = Logger.getDirName()
		fs.writeFileSync(dirName + '/CityMap.txt', JSON.stringify(this.map), (err) => { 
			// In case of a error throw err. 
			if (err) throw err;
			else {
				console.log('successful')
				Logger.clearQueue()
			}
		}) 
	}

	
	// two buildings along roads
	generateBuildings(){
		for (let i = 0; i < this.roads.length; i++) {
			var road = this.roads[i]
			var roadPos = road.position
			var roadSize = road.size

			if (road.direction == Utils.DIRECTION[0] || road.direction == Utils.DIRECTION[1]) {
				var endPos = [roadPos[0], roadPos[1] + roadSize[1]]
				this.createRandomBuilding(roadPos, endPos, true, true)
				this.createRandomBuilding(roadPos, endPos, true, false)
			} else {
				var endPos = [roadPos[0] + roadSize[0], roadPos[1]]
				this.createRandomBuilding(roadPos, endPos, false, true)
				this.createRandomBuilding(roadPos, endPos, false, false)
			}

		}
	}

	createRandomBuilding(startPos, endPos, isVertical, isLeft){
		if (isVertical){
			if (Math.abs(startPos[1] - endPos[1]) <= 2 + MapUtil.MIN_BUILDING_SIZE) { return false }
		} else {
			if (Math.abs(startPos[0] - endPos[0]) <= 2 + MapUtil.MIN_BUILDING_SIZE) { return false}
		}
		var sizeDifference = MapUtil.MAX_BUILDING_SIZE - MapUtil.MIN_BUILDING_SIZE
		var randomSizeW = Math.floor(Math.random() * sizeDifference) + MapUtil.MIN_BUILDING_SIZE
		var randomSizeH = Math.floor(Math.random() * sizeDifference) + MapUtil.MIN_BUILDING_SIZE
		var size = [randomSizeW, randomSizeH]

		var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]

		var posX = 0
		var posY = 0
		if (isVertical) {
			posY = Math.floor(Math.random() * ((endPos[1] - 1) - (startPos[1] + 1))) + startPos[1] + 1
			posX = isLeft ? startPos[0] - randomSizeW : startPos[0] + 1
		} else {
			posX = Math.floor(Math.random() * ((endPos[0] - 1) - (startPos[0] - 1))) + startPos[0] + 1
			posY = isLeft ? startPos[1] + 1 : startPos[1] - randomSizeH
		}

		if (posX < 0 || posY < 0 || posX >= Utils.MAP_SIZE[0] || posY >= Utils.MAP_SIZE[1]){
			return false
		}

		var building = new Building(size, [posX, posY], buildingType, [])
		// check road overlapping
		if (!this.isValid(building)) { return false }
		// building.idx = this.buildings.length
		building.setIdx(this.buildings.length)
		this.buildings.push(building)
	}



    generateRandomPos(){
        return [Math.floor(Math.random() * this.size[0]), Math.floor(Math.random() * this.size[1])]
    }

	generateRandomPosInBuilding(){
		var randomBuilding = this.buildings[Math.floor(Math.random() * this.buildings.length)]
		var randomX = Math.floor(Math.random() * randomBuilding.size[0]) + randomBuilding.position[0]
		var randomY = Math.floor(Math.random() * randomBuilding.size[1]) + randomBuilding.position[1]
		return [randomX, randomY]
	}


	checkIsInABuilding(position){
		for (let i = 0; i < this.buildings.length; i++){
			var curBuilding = this.buildings[i]
			if ((!curBuilding.checkIsDestroyed()) && curBuilding.checkIsInThisBuilding(position)){
				return [true, i]
			}
		}
		return [false]
	}

	checkIsOnARoad(position){
		for (let i = 0; i < this.roads.length; i++){
			if (this.roads[i].checkIsOnRoad(position)) {
				return true
			}
		}
		return false
	}

	getBuilding(idx){
		return this.buildings[idx]
	}

	getBuildingNum(){
		return this.buildings.length
	}
}

module.exports = {
    TempMap,
}