
class Building{
    constructor(size, position, buildingType){
        this.size = size
        this.position = position
        // this.doors = doors
        this.buildingType = buildingType
        this.neighbours = []
    }

    connectToOtherBuilding(){

    }
}

module.exports = {
    Building,
}