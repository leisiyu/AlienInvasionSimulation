const HighLevelEventsPatterns = require("./HighLevelEvents.json")

class HighLevelEvent {
    constructor(eventName,newEvent, highLevelEvent){
        this.eventName = eventName
        this.actors = [newEvent["N1"]]
        if (newEvent["N2"] != "") {
            this.actors.push(newEvent["N2"])
        }
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
        var firstEvent = this.patternEvents[0]
        if (newEvent["L"] == this.tag1) {
            if (newEvent["N1"] == this.actors[firstEvent["char1Idx"]] 
            && newEvent["N2"] == this.actors[firstEvent["char2Idx"]]) {
                return true
            }
        }
        return false
    }

    updateEventIdx(){
        this.index = this.index + 1
    }

    checkNewEvent(newEvent){
        var currentEvent = this.patternEvents[this.index]

        // console.log("hahahahah   ",this.index, this.highLevelEvent["tag"], currentEvent)
        // console.log("hahahah  ", typeof(currentEvent))
        // if (("char1Idx" in currentEvent) && this.actors[currentEvent["char1Idx"]] != newEvent["N1"]) {
        //     // console.log("actors not fit ")
        //     return {"isEnd": false, "isSuccessful": false}
        // }

        // if (("char2Idx" in currentEvent) && this.actors[currentEvent["char2Idx"]] != newEvent["N2"]) {
        //     console.log("actors not fit " + currentEvent["char2Idx"] + " " + newEvent["N2"])
        //     return {"isEnd": false, "isSuccessful": false}
        // }
        for (let i = 0; i < this.highLevelEvent["main_characters"].length; i++){
            var characterIdx = this.highLevelEvent["main_characters"][i]
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

    getJson(){
        var character1 = this.actors[this.highLevelEvent["main_characters"][0]]
        var character2 = this.highLevelEvent["main_characters"].length > 1 ? this.actors[this.highLevelEvent["main_characters"][1]] : ""
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