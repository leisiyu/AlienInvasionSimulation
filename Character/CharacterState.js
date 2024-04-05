const Utils = require('../Utils.js') 

class CharacterState{
    stateType = ""
    target = null
    constructor(state){
        if (!state){
            this.stateType = Utils.CHARACTER_STATES.PATROL
        } else {
            this.stateType = state
        }
        
    }

    setState(stateType, target){
        this.stateType = stateType
        this.target = target

        // console.log("state updated!")
    }

    updateTarget(target){
        this.target = target
    }

    updateState(stateType){
        this.stateType = stateType
    }
}

module.exports = {
    CharacterState,
}