const HighLevelEvents = require("./HighLevelEvents.json")
const HighLevelEventModel = require("./HighLevelEventModel").HighLevelEvent
const Pool = require("./Pool")

function sift(eventLog){
    Pool.updatePool(eventLog)
    matchNew(eventLog)
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


function matchNew(newEvent){
    for (var event in HighLevelEvents) {
        var highLevelEvent = HighLevelEvents[event]
        if (newEvent["L"] == highLevelEvent["events"][0]["tag"]) {
            var newHEvent = new HighLevelEventModel(event, newEvent, highLevelEvent)
            Pool.addIntoPool(newHEvent)
        }
    }
}





module.exports = {
    sift,
}