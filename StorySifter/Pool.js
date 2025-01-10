const fs = require('node:fs')
const HighLevelEvents = require("./HighLevelEvents.json")
// const Logger = require('../Logger').Logger
const HighLevelEventModel = require("./HighLevelEventModel").HighLevelEvent
const SifterUtil = require("./SifterUtil")

var partialMatchPool = []
const poolSize = 5000
var totalPartialMatchNum = 0
var totalCompleteNum = 0
var totalHighLevelEvents = 0
var totalMiniStories = 0
var totalAbandonedEvents = 0
var initiatedHighLevelEvents = 0
var initiatedStories = 0


function matchNew(newEvent){
    for (var eventName in HighLevelEvents) {
        var currentEventModel = HighLevelEvents[eventName]
        var isBelongToOneMatch = false
        for (let i = 0; i < partialMatchPool.length; i++){
            var partialMatch = partialMatchPool[i]
            // isBelongToOneMatch = false
            if (partialMatch.highLevelEventJson["tag"] == currentEventModel["tag"]) {
                isBelongToOneMatch = partialMatch.checkIsNewEventBelongsToThisMatch(newEvent)
                if (isBelongToOneMatch) {
                    break
                }
            }
        }

        if (!isBelongToOneMatch) {
            var currentEventModelFirstEventList = currentEventModel["events"][0]

            for (let i = 0; i < currentEventModelFirstEventList.length; i++) {
                var currentEvent = currentEventModelFirstEventList[i]
                
                if (newEvent["L"] == currentEvent["tag"]
                    && (currentEvent["char1Idx"] == undefined || SifterUtil.checkCharacterType(newEvent["N1"], currentEvent["char1Idx"]["type"]))
                    && (currentEvent["char2Idx"] == undefined || SifterUtil.checkCharacterType(newEvent["N2"], currentEvent["char2Idx"]["type"]))
                ) {
                    var newHighEvent = new HighLevelEventModel(eventName, newEvent, i, currentEventModel)
                    partialMatchPool.push(newHighEvent)
                    totalPartialMatchNum = totalPartialMatchNum + 1
    
                    if (currentEventModel["type"] == "high-level") {
                        initiatedHighLevelEvents = initiatedHighLevelEvents + 1
                    } else if (currentEventModel["type"] == "story") {
                        initiatedStories = initiatedStories + 1
                    }
                }
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
            if (obj.unlessForever) {
                console.log("wrong here")
            }
            removedEventsPool.push(obj)
            // console.log("new pool length " + removedEventsPool.length)
            // console.log("is End!!!" + JSON.stringify(obj.getJson()) + " " + i)
        }

        if (result["isSuccessful"]) {
            totalCompleteNum = totalCompleteNum + 1
            if (obj.highLevelEventJson['type'] == "high-level") {
                totalHighLevelEvents = totalHighLevelEvents + 1
            } else if (obj.highLevelEventJson['type'] == "story"){
                totalMiniStories = totalMiniStories + 1
            }

            // eventFinish(obj.getJson())
        }
    }

    for (let i = 0; i < removedEventsPool.length; i++) {
        var obj = removedEventsPool[i]

        var index = partialMatchPool.indexOf(obj)
        if (index != -1){
            // console.log("test    " + JSON.stringify(obj.getJson()) + " " + JSON.stringify(partialMatchPool[index].getJson()))
            partialMatchPool.splice(index, 1)
        }
    }

    // console.log("partial match num: " + partialMatchPool.length)

    const Logger = require('../Logger').Logger
    for (let i = 0; i < removedEventsPool.length; i++) {
        var obj = removedEventsPool[i]
        Logger.info(obj.getJson())
    }

    // console.log("pool " + partialMatchPool.length)
}

function eventFinish(highLevelEventJson){

    // const Logger = require('../Logger.js').Logger
    // Logger.info(highLevelEventJson)

    // fs.writeFileSync('./HighLevelEventsLog.txt', JSON.stringify(highLevelEventJson) + "\n", {flag: 'a'}, (err) => { 
    //     // In case of a error throw err. 
    //     if (err) throw err;
    //     else {
    //         console.log('successful')
    //     }
    // }) 

}

function getResults(){
    var result = ""
    result = result + "Total partial matches number: " + totalPartialMatchNum + "\n"
    result = result + "Total completed matches number: " + totalCompleteNum + "\n"
    result = result + "Initiated high-level events number: " + initiatedHighLevelEvents + '\n'
    result = result + "Completed high-level events number: " + totalHighLevelEvents + "\n"
    result = result + "Initiated stories number: " + initiatedStories + "\n"
    result = result + "Completed stories number: " + totalMiniStories + "\n"

    for (let i = 0; i < partialMatchPool.length; i++){
        var obj = partialMatchPool[i]
        if (obj.unlessForever) {
            totalAbandonedEvents = totalAbandonedEvents + 1
        }
    }
    result = result + "Abandoned events: " + totalAbandonedEvents + "\n"

    return result
}

function getResultsJson(){
    var result = {
        "partialMatches": totalPartialMatchNum,
        "completeMatches": totalCompleteNum,
        "initiatedHighLevel": initiatedHighLevelEvents,
        "completedHighLevel": totalHighLevelEvents,
        "initiatedStories": initiatedStories,
        "completedStories": totalMiniStories
    }

    return result
}

module.exports = {
    matchNew,
    partialMatchPool,
    updatePool,
    getResults,
    getResultsJson
}