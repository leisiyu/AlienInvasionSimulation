const Utils = require('../Utils.js') 

class CharacterState{
    stateType = ""
    target = {}
    constructor(){
        this.stateType = Utils.CHARACTER_STATES.PATROL
    }

    setState(stateType, target){
        this.stateType = stateType
        this.target = target

        // console.log("state updated!")
    }

    // stateFinished(){
    //     this.stateType = Utils.CHARACTER_MISSION.PATROL
    //     this.target = {}
    // }
}

module.exports = {
    CharacterState,
}