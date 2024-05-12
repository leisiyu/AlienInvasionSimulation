const fs = require('node:fs')
const HighLevelEvents = require("./HighLevelEvents.json")
// const Logger = require('../Logger').Logger
const HighLevelEventModel = require("./HighLevelEventModel").HighLevelEvent

var partialMatchPool = []
const poolSize = 5000

function matchNew(newEvent){
    for (var eventName in HighLevelEvents) {
        var currentEvent = HighLevelEvents[eventName]
        var isBelongToOneMatch = false
        for (let i = 0; i < partialMatchPool.length; i++){
            var partialMatch = partialMatchPool[i]
            isBelongToOneMatch = partialMatch.checkIsNewEventBelongsToThisMatch(newEvent)
            if (isBelongToOneMatch) {
                break
            }
        }

        if (!isBelongToOneMatch) {
            if (newEvent["L"] == currentEvent["events"][0]["tag"]) {
                var newHighEvent = new HighLevelEventModel(eventName, newEvent, currentEvent)
                partialMatchPool.push(newHighEvent)
                console.log("partial matches num: " + partialMatchPool.length)
            }
            
        }
    }
}

function updatePool(newEvent){
    var removedEventsPool = []

    for (let i = 0; i < partialMatchPool.length; i++) {
        var obj = partialMatchPool[i]
        var result = obj.checkNewEvent(newEvent)
        if (result["isEnd"]) {

            removedEventsPool.push(obj)
            // console.log("new pool length " + removedEventsPool.length)
            // console.log("is End!!!" + JSON.stringify(obj.getJson()) + " " + i)
        }

        if (result["isSuccessful"]) {
            eventFinish(obj.getJson())
        }
    }

    for (let i = 0; i < removedEventsPool.length; i++) {
        var obj = removedEventsPool[i]

        var index = partialMatchPool.indexOf(removedEventsPool[i])
        if (index != -1){
            partialMatchPool.splice(index, 1)
        }
    }

    // console.log("partial match num: " + partialMatchPool.length)

    const Logger = require('../Logger').Logger
    for (let i = 0; i < removedEventsPool.length; i++) {
        Logger.info(obj.getJson())
    }

    // console.log("pool " + partialMatchPool.length)
}

function eventFinish(highLevelEventJson){

    // const Logger = require('../Logger.js').Logger
    // Logger.info(highLevelEventJson)

    fs.writeFileSync('./HighLevelEventsLog.txt', JSON.stringify(highLevelEventJson) + "\n", {flag: 'a'}, (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
        }
    }) 


}



module.exports = {
    matchNew,
    partialMatchPool,
    updatePool,
}