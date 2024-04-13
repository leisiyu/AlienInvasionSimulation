const HighLevelEventsPatterns = require("./HighLevelEvents.json")

class HighLevelEvent {
    constructor(eventName,newEvent, highLevelEvent){
        this.eventName = eventName
        this.actor1 = newEvent["N1"]
        this.actor2 = newEvent["N2"]
        this.startTime = newEvent["T"]
        this.unlessEvents = highLevelEvent["unless"]
        this.timeLimit = highLevelEvent["time_limit"]
        this.patternEvents = highLevelEvent["events"]
        this.index = 0
        this.totalEventsNum = Object.keys(highLevelEvent["events"]).length
        this.finishedTime = this.startTime
    }

    updateEventIdx(){
        this.index++
    }

    checkNewEvent(newEvent){
        if (newEvent["T"] > this.startTime + this.timeLimit) {
            console.log("time end: " + newEvent[T] + " " + this.startTime + " " + this.timeLimit)
            return {"isEnd": true, "isSuccessful": false}
        }


        if (this.actor1 != newEvent["N1"] || this.actor2 != newEvent["N2"]) {
            console.log("actors not fit ")
            return {"isEnd": false, "isSuccessful": false}
        }

        if (this.checkUnless(newEvent)) {
            return {"isEnd": true, "isSuccessful": false}
        }
        
        // console.log(this.patternEvents[this.index])
        if (newEvent["L"] == this.patternEvents[this.index]["tag"]){
            this.finishedTime = newEvent["T"]
            this.updateEventIdx()
        }

        if (this.index == this.totalEventsNum - 1) {
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
            "N1": this.actor1,
            "L": this.eventName,
            "N2": this.actor2,
            "T": this.finishedTime
        }
    }
}

module.exports = {
    HighLevelEvent,
}