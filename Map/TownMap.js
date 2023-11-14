const utils = require('../Utils.js'); 
const { Building } = require('./Building.js');
const MapUtil = require("./MapUtil.js")

class TownMap{
	allRooms = []
	allDoors = []

	constructor(mapSize){
		this.width = mapSize[0];
		this.height = mapSize[1]; 

		this.map = [];
		for (var i = 0; i < this.width; i++){
			this.map[i] = [];
			for (var j = 0; j < this.height; j++){
				this.map[i][j] = 0;
				// this.map[i].push(0)
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

	// updateObjectOnTheMap(object, oldPosition, newPosition){
	// 	if (oldPosition.length > 0){
	// 		var objectArray = this.map[oldPosition[0]][oldPosition[1]];
	// 		// console.log("old index" + objectArray.indexOf(object));
	// 		if (objectArray.indexOf(object) != -1) {
	// 			objectArray.slice(objectArray.indexOf(object), objectArray.indexOf(object));
	// 		}
	// 		// console.log("new " + objectArray.indexOf(object) + " " + objectArray.length);
	// 	}
		
	// 	this.map[newPosition[0]][newPosition[1]].push(object);
	// }

	growMap(lastRoom){
		this.allRooms.push(lastRoom)
		this.fillMap(lastRoom)
		var directions = ['up', 'down', 'left', 'right'].sort( () => .5 - Math.random())

		for (var i = 0; i < directions.length; i++) {
			switch(directions[i]){
				case 'up':
					if (lastRoom.position[1] < MapUtil.MIN_BUILDING_SIZE){ continue }

					var width = this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE)
					var minX = Math.max(lastRoom.position[0] - width, 1)
					var maxX = Math.min(lastRoom.position[0] + lastRoom.size[0], this.width - MapUtil.MIN_BUILDING_SIZE)
					var x = this.randMinMax(minX, maxX)

					var height = Math.min(this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE), lastRoom.position[1])
					var y = lastRoom.position[1] - height
					var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]
					var room = new Building([width, height], [x, y], buildingType)
					
					if (this.isValid(room)) {
						lastRoom.neighbours.push(room)
						var doorX = this.randMinMax(Math.max(lastRoom.position[0], x), Math.min(lastRoom.position[0] + lastRoom.size[0], x + width))
						var doorY = lastRoom.position[1]
						this.allDoors.push([doorX, doorY])
						// this.fillMap(room)
						this.growMap(room)
					}

					break
				case 'down':
					if (lastRoom.position[1] + lastRoom.size[1] > utils.MAP_SIZE[1] - MapUtil.MIN_BUILDING_SIZE) { continue }

					var width = this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE)
					var minX = Math.max(lastRoom.position[0] - width, 1)
					var maxX = Math.min(lastRoom.position[0] + lastRoom.size[0] - 1)

					var x = this.randMinMax(minX, maxX)

					var height = Math.min(this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE), this.height - lastRoom.position[1] - lastRoom.size[1])
					var y = lastRoom.position[1] + lastRoom.size[1]

					var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]
					var room = new Building([width, height], [x, y], buildingType)

					if (this.isValid(room)) {
						lastRoom.neighbours.push(room)
						var doorX = this.randMinMax(Math.max(lastRoom.position[0], x), Math.min(lastRoom.position[0] + lastRoom.size[0], x + width))
						var doorY = lastRoom.position[1]
						this.allDoors.push([doorX, doorY])
						// this.fillMap(room)
						this.growMap(room)
					}
					
					break
				case 'left':
					if (lastRoom.position[0] < MapUtil.MIN_BUILDING_SIZE){ continue }

					var height = this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE)
					var minY = Math.max(lastRoom.position[1] - height, 1)
					var maxY = Math.min(lastRoom.position[1] + lastRoom.size[1], utils.MAP_SIZE[1] - MapUtil.MAX_BUILDING_SIZE)
					var y = this.randMinMax(minY, maxY)

					var width = Math.min(this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE))
					var x = lastRoom.position[0] - width

					var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]
					var room = new Building([width, height], [x, y], buildingType)

					if (this.isValid(room)){
						lastRoom.neighbours.push(room)

						var doorY = this.randMinMax(Math.max(lastRoom.position[1], y), Math.min(lastRoom.position[y] + lastRoom.size[1], y + height))
						var doorX = lastRoom.position[0]
						this.allDoors.push([doorX, doorY])

						// this.fillMap(room)
						this.growMap(room)
					}


					break
				case 'right':
					if (lastRoom.position[0] + lastRoom.size[0] > this.width - MapUtil.MIN_BUILDING_SIZE){ continue }

					var height = this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE)
					var minY = Math.max(lastRoom.position[1] - height, 1)
					var maxY = Math.min(lastRoom.position[1] + lastRoom.size[1], this.height - MapUtil.MIN_BUILDING_SIZE)
					var y = this.randMinMax(minY, maxY)

					var width = Math.min(this.randMinMax(MapUtil.MIN_BUILDING_SIZE, MapUtil.MAX_BUILDING_SIZE), this.width - lastRoom.position[0] - lastRoom.size[0])
					var x = lastRoom.position[0] + lastRoom.size[0] 

					var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]
					var room = new Building([width, height], [x, y], buildingType)

					if (this.isValid(room)){
						lastRoom.neighbours.push(room);
						
						var doorY = this.randMinMax(Math.max(lastRoom.position[1], y), Math.min(lastRoom.position[1] + lastRoom.size[1], y + height))
						var doorX = x

						this.allDoors.push([doorX, doorY])

						// this.fillMap(room)
						this.growMap(room)
					}

					break
			}
		}
	}

	randMinMax(min, max){
		return Math.ceil(Math.random() * (max - min)) + min;
	}

	isValid(room){
		var x = room.position[0]
		var y = room.position[1]
		var w = room.size[0]
		var h = room.size[1]

		if (x < 0 || x + w >= this.width) { return false }
		if (y < 0 || y + h >= this.height) { return false }

		// overlapping check
		for (var i = x; i < x + w; i++){
			for (var j = y; j < y + h; j++){
				// if (this.map[i] && this.map[i][j] === 1) { return false }
				if (this.map[i][j] == 1) { return false }
			}
		}

		return true
	}

	fillMap(room){
		for (var i = room.position[0]; i <= room.position[0] + room.size[0]; i++){
			for (var j = room.position[1]; j <= room.position[1] + room.size[1]; j++)
				this.map[i][j] = 1
		}
	}

	createRandomRoom(){
		var x = Math.floor(Math.random() * (this.width - MapUtil.MAX_BUILDING_SIZE))
		var y = Math.floor(Math.random() *(this.height - MapUtil.MAX_BUILDING_SIZE))
		var w = Math.ceil(Math.random() * (MapUtil.MAX_BUILDING_SIZE - MapUtil.MIN_BUILDING_SIZE)) + MapUtil.MIN_BUILDING_SIZE
		var h = Math.ceil(Math.random() * (MapUtil.MAX_BUILDING_SIZE - MapUtil.MIN_BUILDING_SIZE)) + MapUtil.MIN_BUILDING_SIZE
		var buildingType = MapUtil.BUILDING_TYPE[Math.floor(Math.random() * MapUtil.BUILDING_TYPE.length)]

		var building = new Building([w,h], [x,y], buildingType)
		return building
	}

	createRandomMap(){
		var room = this.createRandomRoom()
		this.growMap(room)
	}
}

module.exports = {
	TownMap,
}