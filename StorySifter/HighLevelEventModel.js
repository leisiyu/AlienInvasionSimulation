const HighLevelEventsPatterns = require("./HighLevelEvents.json")

class HighLevelEvent {
    constructor(eventName,newEvent, highLevelEvent){
        this.eventName = eventName
        this.actors = [newEvent["N1"], newEvent["N2"]]
        this.startTime = newEvent["T"]
        this.highLevelEvent = highLevelEvent
        this.unlessEvents = highLevelEvent["unless"]
        this.timeLimit = highLevelEvent["time_limit"]
        this.patternEvents = highLevelEvent["events"]
        this.index = 0
        this.totalEventsNum = Object.keys(highLevelEvent["events"]).length
        this.finishedTime = this.startTime
        this.eventIDs = [newEvent["id"]]
    }

    updateEventIdx(){
        this.index++
    }

    checkNewEvent(newEvent){
        if (newEvent["T"] > this.startTime + this.timeLimit) {
            console.log("time end: " + newEvent[T] + " " + this.startTime + " " + this.timeLimit)
            return {"isEnd": true, "isSuccessful": false}
        }

        var currentEvent = this.highLevelEvent["events"][this.index]
        if (this.actors[currentEvent["char1Idx"]] != newEvent["N1"] || this.actors[currentEvent["char2Idx"]] != newEvent["N2"]) {
            console.log("actors not fit ")
            return {"isEnd": false, "isSuccessful": false}
        }

        if (this.checkUnless(newEvent)) {
            return {"isEnd": true, "isSuccessful": false}
        }
        
        // console.log(this.patternEvents[this.index])
        if (newEvent["L"] == this.patternEvents[this.index]["tag"]){
            this.finishedTime = newEvent["T"]
            this.eventIDs.push(newEvent["id"])
            this.updateEventIdx()
            console.log("update time to " + newEvent["T"])
        }

        if (this.index >= this.totalEventsNum) {
            return {"isEnd": true, "isSuccessful": true}
        }

        return {"isEnd": false, "isSuccessful": false}
    }

    checkUnless(newEvent){
        for (let i = 0; i < this.unlessEvents.length; i++) {
            // this.actor1 == newEvent["N1"] && this.actor2 == newEvent["N2"]
            if (newEvent["L"] == this.unlessEvents[i]["tag"]) {
                return true
            }
        }
        return false
    }

    getJson(){
        return {
            "N1": this.actors[0],
            "L": this.eventName,
            "N2": this.actors[1],
            "T": this.finishedTime,
            "ids": this.eventIDs
        }
    }
}

module.exports = {
    HighLevelEvent,
}