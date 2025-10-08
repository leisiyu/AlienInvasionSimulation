const Utils = require('../Utils.js') 

var idx = 0

class Gear{
    constructor(type, subType, value, durability){
        this.gearType = type
        this.subType = subType
        this.value = value
        this.durability = durability
        this.name = this.subType + idx
        this.mapPosition = [0, 0]
        this.state = Utils.GEAR_STATE.NORMAL
        idx ++
    }

    updateMapPosition(pos){
        this.mapPosition = pos
    }

    // reduce durability every time use this gear
    use(time) {
        this.durability = this.durability - 1
        // console.log("hahahahah    " + this.name + " " + this.durability)
        if (this.durability <= 0) {
            console.log("hahah   the gear is broken")
            this.state = Utils.GEAR_STATE.BROKEN
            // Lazy require to avoid circular dependency
            const Logger = require('../Logger.js').Logger
            Logger.statesInfo(JSON.stringify({
                N: this.name,
                S: this.state,
                P: "",
                T: time,
            }))
            return false
        }
        return true
    }

}

module.exports = {
    Gear,
}