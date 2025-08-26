// Drama manager
// Weak action based intra-manifold
const HighLevelEvents = require("../StorySifter/HighLevelEvents.json")

// check in every beat
function checkPartialMatchPool(pool){
    // for (partialMatch in pool) {
    for (let i = 0; i < pool.length; i++) {
        var partialMatch = pool[i]
        if (partialMatch.type == "story") {
            tobeIntervenedEvent = findNextLowestEvent(partialMatch)
            if (tobeIntervenedEvent) {
                intervene(tobeIntervenedEvent, partialMatch)
            }
        }
    }
}

function intervene(nextEvent, partialMatch){
    if (nextEvent) {
        console.log("Intervening in the story... " + partialMatch.highLevelEventJson["tag"])
    } else {
        console.log("No next lowest event found for intervention.")
    }
}

function findLowerLevelEventJson(nextEvent){
    for (let i = 0; i < HighLevelEvents.length; i++) {
        var eventJson = HighLevelEvents[i]
        if (eventJson["tag"] == nextEvent["tag"]) {
            // if (eventJson["type"] == "high-level") {
                return eventJson
            // }
        }
    }
    return null
}

function findNextLowestEvent(partialMatch, pool){
    var lowestPartialMatch = findLowestPartialMatch(partialMatch, pool)
    var nextEvent = lowestPartialMatch.getNextEvent()
    var nextEventJson = findLowerLevelEventJson(nextEvent)
    if (nextEventJson != null) {
        // if the "nextEventJson" exists, means there is no partial match 
        // related with this event in the pool 
        // So the first event in the "nextEventJson" is the next event to be intervened
        // But there may be multiple events in the "nextEventJson"???????????
        return nextEventJson["events"]
    } else {
        // if the "nextEventJson" doesn't exist, the "nextEvent" is the final low-level event
        return nextEvent
    }
}

function findLowestPartialMatch(currentPartialMatch, pool){
    var nextEvent = currentPartialMatch.getNextEvent()
    var lowerLevelEventJson = findLowerLevelEventJson(nextEvent)
    var nextLevelPartialMatch = currentPartialMatch
    if (lowerLevelEventJson) {
        // for (partial in pool) {
        for (let i = 0; i < pool.length; i++) {
            var partial = pool[i]
            if (partial.highLevelEventJson["tag"] == lowerLevelEventJson["tag"]
                && partial.actors[0] == currentPartialMatch.actors[0]
                && (partial.actors[1] == undefined || (partial.actors[1] == currentPartialMatch.actors[1]))
            ) {
                nextLevelPartialMatch = partial
                nextLevelPartialMatch = findLowestPartialMatch(nextLevelPartialMatch, pool)
                break
            }
        }
    }

    return nextLevelPartialMatch
}

module.exports = {
    checkPartialMatchPool,
}