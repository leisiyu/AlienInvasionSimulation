const HighLevelEventsPatterns = require("./HighLevelEvents.json")

class HighLevelEvent {
    constructor(eventName,newEvent, highLevelEvent){
        this.eventName = eventName
        this.actors = [newEvent["N1"], newEvent["N2"]]
        this.startTime = newEvent["T"]
        this.tag1 = newEvent["L"]
        this.highLevelEvent = highLevelEvent
        this.unlessEvents = highLevelEvent["unless"]
        this.timeLimit = highLevelEvent["time_limit"]
        this.patternEvents = highLevelEvent["events"]
        this.index = 1 // start with the 0th + 1
        this.totalEventsNum = highLevelEvent["events"].length
        this.finishedTime = this.startTime
        this.eventIDs = [newEvent["id"]]
    }

    // check if there's a partial match already in the pool
    // with the same characters and log
    checkIsTheSameEvent(newEvent){
        if (newEvent["N1"] == this.actors[0] 
            && newEvent["N2"] == this.actors[1]
            && newEvent["L"] == this.tag1) {
                return true
        }
        return false
    }

    updateEventIdx(){
        this.index = this.index + 1
    }

    checkNewEvent(newEvent){
        var currentEvent = this.patternEvents[this.index]

        if (( currentEvent["char1Idx"] != undefined && this.actors[currentEvent["char1Idx"]] != newEvent["N1"])) {
            console.log("actors not fit ")
            return {"isEnd": false, "isSuccessful": false}
        }

        if ((currentEvent["char2Idx"] != undefined && this.actors[currentEvent["char2Idx"]] != newEvent["N2"])) {
            console.log("actors not fit ")
            return {"isEnd": false, "isSuccessful": false}
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
            console.log("update time to " + newEvent["T"])

            // check if there's a new character involved
            if (currentEvent["char1Idx"] != undefined && typeof this.actors[currentEvent["char1Idx"]] === "undefined") {
                this.actors.push(newEvent["N1"])
            }
            if (currentEvent["char2Idx"] != undefined && typeof this.actors[currentEvent["char2Idx"]] === "undefined") {
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

    getJson(){
        var character1 = this.actors[this.highLevelEvent["main_characters"][0]]
        var character2 = this.highLevelEvent["main_characters"][1] != undefined ? this.actors[this.highLevelEvent["main_characters"][1]] : ""
        return {
            "N1": character1,
            "L": this.highLevelEvent["tag"],
            "N2": character2,
            "T": this.finishedTime,
            "ids": this.eventIDs
        }
    }
}

module.exports = {
    HighLevelEvent,
}