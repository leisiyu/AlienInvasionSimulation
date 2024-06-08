const HighLevelEventsPatterns = require("./HighLevelEvents.json")

class HighLevelEvent {
    constructor(eventName,newEvent, highLevelEventJson){
        this.eventName = eventName
        this.actors = [newEvent["N1"]]
        if (newEvent["N2"] != "") {
            this.actors.push(newEvent["N2"])
        }
        this.startTime = newEvent["T"]
        this.tag1 = newEvent["L"]
        this.highLevelEventJson = highLevelEventJson
        this.unlessEvents = highLevelEventJson["unless"]
        this.timeLimit = highLevelEventJson["time_limit"]
        this.patternEvents = highLevelEventJson["events"]
        this.index = 1 // start with the 0th + 1
        this.totalEventsNum = highLevelEventJson["events"].length
        this.finishedTime = this.startTime
        this.eventIDs = [newEvent["id"]]
        this.unlessForever = false
    }

    // check if there's a partial match already in the pool
    // with the same characters and log
    // this function does not check the newest event in the event list
    checkIsNewEventBelongsToThisMatch(newEvent){
        for (let i = 0; i < this.index; i++){
            var currentEvent = this.patternEvents[i]
            if (newEvent["L"] == currentEvent["tag"]
                && currentEvent["repeat"]
                && newEvent["N1"] == this.actors[currentEvent["char1Idx"]]
                && newEvent["N2"] == this.actors[currentEvent["char2Idx"]]){
                    return true
            }
        }

        return false
    }

    updateEventIdx(){
        this.index = this.index + 1
    }

    checkNewEvent(newEvent){
        // check the old events
        // if matched and "repeat", then add to the event list
        for (let i = 0; i < this.index; i++){
            var event = this.patternEvents[i]
            if (event["repeat"]
                && newEvent["N1"] == this.actors[event["char1Idx"]]
                && newEvent["N2"] == this.actors[event["char2Idx"]]
                && newEvent["L"] == event["tag"]) {
                    this.eventIDs.push(newEvent["id"])
                    return {"isEnd": false, "isSuccessful": false}
                }
        }

        // check the next event
        var currentEvent = this.patternEvents[this.index]

        if (this.checkUnlessForever(newEvent)){
            // console.log("unless forever " + currentEvent["tag"] + this.eventIDs)
            return {"isEnd": false, "isSuccessful": false}
        }

        // if (("char1Idx" in currentEvent) && this.actors[currentEvent["char1Idx"]] != newEvent["N1"]) {
        //     // console.log("actors not fit ")
        //     return {"isEnd": false, "isSuccessful": false}
        // }

        // if (("char2Idx" in currentEvent) && this.actors[currentEvent["char2Idx"]] != newEvent["N2"]) {
        //     console.log("actors not fit " + currentEvent["char2Idx"] + " " + newEvent["N2"])
        //     return {"isEnd": false, "isSuccessful": false}
        // }
        for (let i = 0; i < this.highLevelEventJson["main_characters"].length; i++){
            var characterIdx = this.highLevelEventJson["main_characters"][i]
            if (newEvent["N1"] != this.actors[characterIdx] && newEvent["N2"] != this.actors[characterIdx]) {
                
                return {"isEnd": false, "isSuccessful": false}
            }
        }

        if (newEvent["L"] != this.patternEvents[this.index]["tag"]) {
            return {"isEnd": false, "isSuccessful": false}
        }

        if (newEvent["T"] > this.startTime + this.timeLimit) {
            console.log("time end: " + newEvent["T"] + " " + this.startTime + " " + this.timeLimit)
            return {"isEnd": true, "isSuccessful": false}
        }

        if (this.checkUnless(newEvent)) {
            return {"isEnd": true, "isSuccessful": false}
        }
        
        if (newEvent["L"] == this.patternEvents[this.index]["tag"]){
            this.finishedTime = newEvent["T"]
            this.eventIDs.push(newEvent["id"])
            this.updateEventIdx()
            // console.log("update time to " + newEvent["T"])

            // check if there's a new character involved
            if (currentEvent["char1Idx"] != undefined && typeof this.actors[currentEvent["char1Idx"]] === "undefined") {
                this.actors.push(newEvent["N1"])
            }
            if (currentEvent["char2Idx"] != undefined && typeof this.actors[currentEvent["char2Idx"]] === "undefined" && newEvent["N2"] != "") {
                this.actors.push(newEvent["N2"])
            }
        }

        if (this.index >= this.totalEventsNum) {
            return {"isEnd": true, "isSuccessful": true}
        }

        return {"isEnd": false, "isSuccessful": false}
    }

    checkUnless(newEvent){
        for (let i = 0; i < this.unlessEvents.length; i++) {
            var currentUnlessEvent = this.unlessEvents[i]
            // characters in this part should be involved in earlier events,
            // so no need to check if this character in the actors array
            if (newEvent["L"] == this.unlessEvents[i]["tag"]) {
                if (currentUnlessEvent["char1Idx"] == undefined || this.actors[currentUnlessEvent["char1Idx"]] == newEvent["N1"]) {
                    if (currentUnlessEvent["char2Idx"] == undefined || this.actors[currentUnlessEvent["char2Idx"]] == newEvent["N2"]) {
                        return true
                    }
                }
                
            }
        }
        return false
    }

    checkUnlessForever(newEvent){
        if (this.unlessForever) { return true }

        if (this.highLevelEventJson["unless_forever"] != undefined){
            for (let i = 0; i < this.highLevelEventJson["unless_forever"].length; i++){
                var currentEvent = this.highLevelEventJson["unless_forever"][i]
                if (newEvent["L"] == currentEvent["tag"]){
                    if (currentEvent["char1Idx"] == undefined || this.actors[currentEvent["char1Idx"]] == newEvent["N1"]) {
                        if (currentEvent["char2Idx"] == undefined || this.actors[currentEvent["char2Idx"]] == newEvent["N2"]) {
                            this.unlessForever = true
                            return true
                        }
                    }
                }
            }
        }
        return false
    }
        
    getJson(){
        // console.log("haha2   " + this.actors)
        var character1 = this.actors[this.highLevelEventJson["main_characters"][0]]
        var character2 = this.highLevelEventJson["main_characters"].length > 1 ? this.actors[this.highLevelEventJson["main_characters"][1]] : ""
        return {
            "N1": character1,
            "L": this.highLevelEventJson["tag"],
            "N2": character2,
            "T": this.finishedTime,
            "ids": this.eventIDs,
            "type": this.highLevelEventJson['type']
        }
    }
}

module.exports = {
    HighLevelEvent,
}