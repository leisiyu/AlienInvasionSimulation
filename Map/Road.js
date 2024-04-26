
// anchor point: left up
class Road{
    constructor(position, size, direction, idx){
        this.position = position
        this.size = size
        this.direction = direction
        this.idx = idx
    }

    checkIsOnRoad(position){
        if (this.position[0] <= position[0] && position[0] < this.position[0] + this.size[0]
            && this.position[1] <= position[1] && position[1] < this.position[1] + this.size[1]) {
                return true
            }
        return false
    }

}

module.exports = {
    Road,
}