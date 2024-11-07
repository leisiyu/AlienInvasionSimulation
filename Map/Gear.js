var idx = 0

class Gear{
    constructor(type, value, durability){
        this.gearType = type
        this.value = value
        this.durability = durability
        this.name = this.gearType + idx
        this.mapPosition = [0, 0]
        idx ++
    }

    updateMapPosition(pos){
        this.mapPosition = pos
    }

    use() {
        this.durability = this.durability - 1

        switch(this.gearType){
            
        }

        if (this.durability <= 0) {
            return false
        }
        return true
    }

    heal(target) {
        
    }


}

module.exports = {
    Gear,
}