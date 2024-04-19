const fs = require('node:fs')
const HighLevelEvents = require("./HighLevelEvents.json")
const HighLevelEventModel = require("./HighLevelEventModel").HighLevelEvent

var partialMatchPool = []
const poolSize = 5000

function matchNew(newEvent){
    for (let i = 0; i < partialMatchPool.length; i++) {
        var obj = partialMatchPool[i]
        if (obj.checkIsTheSameEvent(newEvent)) {
            return
        }
    }
    for (var event in HighLevelEvents) {
        var highLevelEvent = HighLevelEvents[event]
        if (newEvent["L"] == highLevelEvent["events"][0]["tag"]) {
            var newHighEvent = new HighLevelEventModel(event, newEvent, highLevelEvent)
            partialMatchPool.push(newHighEvent)
            console.log("partial matches num: " + partialMatchPool.length)
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
            console.log("new pool length " + removedEventsPool.length)
            console.log("is End!!!" + JSON.stringify(obj.getJson()) + " " + i)
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

        updatePool(obj.getJson)
        matchNew(obj.getJson())
    }


    console.log("pool " + partialMatchPool.length)
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