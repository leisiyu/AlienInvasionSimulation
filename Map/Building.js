
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

    checkIfInThisBuilding(charPos){
        if (charPos[0] >= this.position[0] && charPos[0] < this.position[0] + this.size[0]
            && charPos[1] >= this.position && charPos[1] < this.position[1] + this.size[1]) {
                return true
        }
        return false
    }
}

module.exports = {
    Building,
}