const HighLevelEvents = require("./HighLevelEvents.json")
const Pool = require("./Pool")

function sift(eventLog){
    Pool.updatePool(eventLog)
    Pool.matchNew(eventLog)
}

function getEventsById(id){
    for (var event in HighLevelEvents){
        if (HighLevelEvents[event].id == id) {
            // console.log(HighLevelEvents[event])
            return HighLevelEvents[event]
        }
    }
    console.log("no event with id: " + id + ". Have a check!")
}

function getFinalResults(){
    return Pool.getResults()
}




module.exports = {
    sift,
    getFinalResults,
}