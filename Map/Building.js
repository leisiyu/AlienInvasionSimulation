const MapUtil = require("./MapUtil.js")
const Utils = require('../Utils.js') 

// anchor point:[0, 1]
class Building{
    constructor(size, position, buildingType, doors){
        this.type = "building"
        this.size = size
        this.position = position
        this.buildingType = buildingType
        this.neighbours = []
        this.doors = doors
        // this.state = MapUtil.BUILDING_STATE.NORMAL
        this.maxhp = 2000 + Math.floor(Math.random() * 1000)
        this.hp = this.maxhp
        // this.ownerType = null
        this.idx = 0
    }

    setIdx(idx){
        this.idx = idx
    }

    getName(){
        return "building" + this.idx
    }

    isAccessibleTo(characterType){
        if (this.state == MapUtil.BUILDING_STATE.DESTROYED) { return false }
        // if (this.isDestroyed()) { return false }

        if (this.ownerType == null) { return true } 

        if (this.ownerType == Utils.CHARACTER_TYPE.ALIEN) {
            return characterType == Utils.CHARACTER_TYPE.ALIEN
        }

        if (this.ownerType == Utils.CHARACTER_TYPE.SOLDIER || this.ownerType == Utils.CHARACTER_TYPE.TOWNFOLK) {
            return characterType == Utils.CHARACTER_TYPE.SOLDIER || characterType == Utils.CHARACTER_TYPE.TOWNFOLK
        }
    }

    // updateOwnerType(ownerType) {
    //     this.ownerType = ownerType
    // }

    checkIsInThisBuilding(position){
        if (position[0] >= this.position[0] && position[0] < this.position[0] + this.size[0]
            && position[1] >= this.position[1] && position[1] < this.position[1] + this.size[1]) {
                return true
        }
        return false
    }

    checkIsDestroyed(){
        return this.state == MapUtil.BUILDING_STATE.DESTROYED
    }
    
    calculateDistance(position) {
        var distance = 0
        if (this.checkIsInThisBuilding(position)) {
            return distance
        }

        if (this.position[0] + this.size[0] <= position[0]) {
            distance = distance + Math.abs(this.position[0] + this.size[0] - position[0])
        }
        if (this.position[0] >= position[0]) {
            distance = distance + Math.abs(this.position[0] - position[0])
        }
        if (this.position[1] + this.size[1] <= position[1]) {
            distance = distance + Math.abs(this.position[1] + this.size[1] - position[1])
        }
        if (this.position[1] >= position[1]) {
            distance = distance + Math.abs(this.position[1] - position[1])
        }

        return distance
    }

    isAttacked(value){
        this.hp = this.hp - value
        if (this.hp <= 0) {
            this.state = MapUtil.BUILDING_STATE.DESTROYED
        }
    }
    // checkIsNeighbourToThisBuilding(position){
    //     if (this.checkIsInThisBuilding(position)) {
    //         return false
    //     }
    //     if (this.checkIsInThisBuilding([position[0] + 1, position[1]]) ||
    //         this.checkIsInThisBuilding([position[0] - 1, position[1]]) ||
    //         this.checkIsInThisBuilding([position[0], position[1] + 1]) ||
    //         this.checkIsInThisBuilding([position[0], position[1] - 1])) {
    //             return true
    //     }
    //     return false
    // }

    // checkPosAccessible(position){
    //     if (this.checkIsInThisBuilding(position)) {
    //         return true
    //     } else {
    //         if (this.checkIsNeighbourToThisBuilding(position)) {
    //             for (let i = 0; i < this.doors.length; i++) {
    //                 var door = this.doors[i]
    //                 if (door[0] == position[0]) {
    //                     return door[1] == position[1] + 1 || door[1] == position[1] - 1
    //                 }
    //                 if (door[1] == position[1]) {
    //                     return door[0] == position[0] + 1 || door[0] == position[0] - 1
    //                 }
    //             }
    //             return false
    //         } else {
    //             return false
    //         }
    //     }
    // }
}

module.exports = {
    Building,
}