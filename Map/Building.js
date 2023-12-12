
class Building{
    constructor(size, position, buildingType, doors){
        this.size = size
        this.position = position
        // this.doors = doors
        this.buildingType = buildingType
        this.neighbours = []
        this.doors = doors
    }

    connectToOtherBuilding(){

    }

    checkIsInThisBuilding(position){
        if (position[0] >= this.position[0] && position[0] < this.position[0] + this.size[0]
            && position[1] >= this.position[1] && position[1] < this.position[1] + this.size[1]) {
                return true
        }
        return false
    }

    checkIsNeighbourToThisBuilding(position){
        if (this.checkIsInThisBuilding(position)) {
            return false
        }
        if (this.checkIsInThisBuilding([position[0] + 1, position[1]]) ||
            this.checkIsInThisBuilding([position[0] - 1, position[1]]) ||
            this.checkIsInThisBuilding([position[0], position[1] + 1]) ||
            this.checkIsInThisBuilding([position[0], position[1] - 1])) {
                return true
        }
        return false
    }

    checkPosAccessible(position){
        if (this.checkIsInThisBuilding(position)) {
            return true
        } else {
            if (this.checkIsNeighbourToThisBuilding(position)) {
                for (let i = 0; i < this.doors.length; i++) {
                    var door = this.doors[i]
                    if (door[0] == position[0]) {
                        return door[1] == position[1] + 1 || door[1] == position[1] - 1
                    }
                    if (door[1] == position[1]) {
                        return door[0] == position[0] + 1 || door[0] == position[0] - 1
                    }
                }
                return false
            } else {
                return false
            }
        }
    }
}

module.exports = {
    Building,
}