var idx = 0

class Gear{
    constructor(type, subType, value, durability){
        this.gearType = type
        this.subType = subType
        this.value = value
        this.durability = durability
        this.name = this.subType + idx
        this.mapPosition = [0, 0]
        idx ++
    }

    updateMapPosition(pos){
        this.mapPosition = pos
    }

    // reduce durability every time use this gear
    use() {
        this.durability = this.durability - 1
        // console.log("hahahahah    " + this.name + " " + this.durability)
        if (this.durability <= 0) {
            return false
        }
        return true
    }

}

module.exports = {
    Gear,
}