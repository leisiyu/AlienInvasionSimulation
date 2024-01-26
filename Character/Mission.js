const Utils = require('../Utils.js') 

class Mission{
    missionType = Utils.CHARACTER_MISSION.NONE
    target = {}
    constructor(){

    }

    setMission(missionType, target){
        this.missionType = missionType
        this.target = target

        console.log("mission updated!")
    }

    missionFinished(){
        this.missionType = Utils.CHARACTER_MISSION.NONE
        this.target = {}
    }
}

module.exports = {
    Mission,
}