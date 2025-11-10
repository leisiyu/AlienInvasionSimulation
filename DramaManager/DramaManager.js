// Drama manager
// Weak action based intra-manifold
// const HighLevelEvents = require("../StorySifter/HighLevelEvents.json")
const HighLevelEvents = require("../StorySifter/HighLevelEventsTest.json")
const Intervention = require("./Intervention.js")

// check in every beat
function checkPartialMatchPool(pool){
    // for (partialMatch in pool) {
    for (let i = 0; i < pool.length; i++) {
        var partialMatch = pool[i]
        if (partialMatch.type == "story") {
            tobeIntervenedEvents = findNextLowestEvents(partialMatch, pool)
            if (tobeIntervenedEvents) {
                console.log("partial match: " + partialMatch.eventName)
                intervene(tobeIntervenedEvents, partialMatch)
            }
        }
    }
}

function intervene(nextEvents, partialMatch){
    if (nextEvents.length != 0) {
        // console.log("next events[0]: " + nextEvents[0]["L"] + nextEvents[0]["N1"] + nextEvents[0]["N2"])
        Intervention.intervene(nextEvents[0])
    } else {
        console.log("No next lowest event found for intervention.")
    }
}

// Check if the next events have event jsons in the high-level event list
function findLowerLevelEventJson(nextEvents){
    var nextJsons = []
    for (let i = 0; i < nextEvents.length; i++) {
        var nextEvent = nextEvents[i]
        // for (let j = 0; j < HighLevelEvents.length; j++) {
        for (var eventName in HighLevelEvents) {
            var eventJson = HighLevelEvents[eventName]
            var mainCharacters = eventJson["main_characters"]
            if (eventJson["tag"] == nextEvent["L"]) {
                
                for (let j = 0; j < eventJson["events"][0].length; j++) {
                    var tempJson = {
                            "L": eventJson["events"][0][j]["tag"],
                            
                        }
                    if (eventJson["events"][0][j]["char1Idx"] != undefined) {
                        if (mainCharacters[0] == eventJson["events"][0][j]["char1Idx"]["index"]) {
                            tempJson["N1"] = nextEvent["N1"]
                        }
                    }
                    if (eventJson["events"][0][j]["char2Idx"] != undefined) {
                        if (mainCharacters[1] == eventJson["events"][0][j]["char2Idx"]["index"]) {
                            tempJson["N2"] = nextEvent["N2"]
                        }
                    }
                    nextJsons.push(tempJson)
                }
            }
        }
    }

    return nextJsons
}

function findLowestLevelJson(nextEvents){
    var lowestJsons = findLowerLevelEventJson(nextEvents)
    if (lowestJsons.length == 0) {
        return lowestJsons
    } else {
        lowerJsons = findLowestLevelJson(lowestJsons, [])
        if (lowerJsons.length != 0) {
           lowestJsons = lowerJsons
        }
        return lowestJsons
    }

}

//// Be careful if there are multiple layers
function findNextLowestEvents(partialMatch, pool){
    var lowestPartialMatch = findLowestPartialMatch(partialMatch, pool)
    // var actors = partialMatch.getActors()
    var nextEvents = lowestPartialMatch.getNextEvents()
    console.log("next events " + nextEvents[0]["N1"] + " " + nextEvents[0]["N2"] + " " + nextEvents[0]["L"])
    var nextEventJsons = findLowestLevelJson(nextEvents)
    console.log("next Jsons " + nextEventJsons.length)
    if (nextEventJsons.length != 0) {
        return nextEventJsons
    } else {
        // if the "nextEventJson" doesn't exist, the "nextEvent" is the final low-level event
        return nextEvents
    }
}

//// TO DO: there may be multiple low-level partial matches eligible
//// But in our current design, there should be only one
function findLowestPartialMatch(currentPartialMatch, pool){
    var nextEvents = currentPartialMatch.getNextEvents()
    // var actors = currentPartialMatch.getActors()
    var lowerLevelEventJsons = findLowerLevelEventJson(nextEvents)
    var nextLevelPartialMatch = currentPartialMatch
    if (lowerLevelEventJsons.length != 0) {
        // var nextLevelPartialMatchs = []
        
        exitLoop: for (let i = 0; i < pool.length; i++) {
            var partial = pool[i]
            for (let j = 0; j < lowerLevelEventJsons.length; j++) {
                var lowerLevelEventJson = lowerLevelEventJsons[j]
                // if (partial.highLevelEventJson["tag"] == lowerLevelEventJson["tag"]
                //     && partial.actors[0] == currentPartialMatch.actors[0]
                //     && (partial.actors[1] == undefined || currentPartialMatch.actors[1] == undefined || (partial.actors[1] == currentPartialMatch.actors[1]))
                if (partial.highLevelEventJson["tag"] == lowerLevelEventJson["tag"]
                    && partial.actors[partial.mainCharacters[0]] == currentPartialMatch.actors[currentPartialMatch.mainCharacters[0]]
                    && ((partial.mainCharacters[1] == undefined && currentPartialMatch.mainCharacters[1] == undefined) 
                        || partial.actors[partial.mainCharacters[1]] == currentPartialMatch.actors[currentPartialMatch.mainCharacters[1]])
                ) {
                    nextLevelPartialMatch = partial
                    nextLevelPartialMatch = findLowestPartialMatch(nextLevelPartialMatch, pool)
                    break exitLoop
                    // break
                }
            }
            
        }
    }

    return nextLevelPartialMatch
}

module.exports = {
    checkPartialMatchPool,
}