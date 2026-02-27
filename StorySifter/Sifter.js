// const HighLevelEvents = require("./HighLevelEvents.json")
const Pool = require("./Pool")
const Util = require("../Utils")

function sift(eventLog){
    var successEvents = Pool.updatePool(eventLog)
    Pool.matchNew(eventLog, successEvents)
}

// function getEventsById(id){
//     for (var event in HighLevelEvents){
//         if (HighLevelEvents[event].id == id) {
//             // console.log(HighLevelEvents[event])
//             return HighLevelEvents[event]
//         }
//     }
//     console.log("no event with id: " + id + ". Have a check!")
// }

function getFinalResults(){
    return Pool.getResults()
}

function getFinalResultsJson(){
    return Pool.getResultsJson()
}


module.exports = {
    sift,
    getFinalResults,
    getFinalResultsJson,
}