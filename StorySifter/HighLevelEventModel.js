const HighLevelEventsPatterns = require("./HighLevelEvents.json")

class HighLevelEvent {
    constructor(eventName,newEvent, firstEventIdx, highLevelEventJson){
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
        this.eventIdxs = [firstEventIdx]
        this.totalEventsNum = highLevelEventJson["events"].length
        this.finishedTime = this.startTime
        this.eventIDs = [newEvent["id"]]
        this.meetUnlessForeverConditionTimes = 0
    }

    // check if there's a partial match already in the pool
    // with the same characters and log
    // this function does not check the newest event in the event list
    checkIsNewEventBelongsToThisMatch(newEvent){
        for (let i = 0; i < this.index; i++){
            for (let j = 0; j < this.patternEvents[i].length; j++){
                var currentEvent = this.patternEvents[i][j]
                if (newEvent["L"] == currentEvent["tag"]
                    && currentEvent["repeat"]
                    && newEvent["N1"] == this.actors[currentEvent["char1Idx"]]
                    && newEvent["N2"] == this.actors[currentEvent["char2Idx"]]){
                        return true
                }
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
            // for (let j = 0; j < this.patternEvents[i].length; j++){
                var event = this.patternEvents[i][this.eventIdxs[i]]
                if (event["repeat"]
                    && newEvent["N1"] == this.actors[event["char1Idx"]]
                    && newEvent["N2"] == this.actors[event["char2Idx"]]
                    && newEvent["L"] == event["tag"]) {
                        this.eventIDs.push(newEvent["id"])
                        return {"isEnd": false, "isSuccessful": false}
                    }
            // }
            
        }

        if (this.checkUnlessForever(newEvent)){
            // console.log("unless forever " + currentEvent["tag"] + this.eventIDs)
            return {"isEnd": false, "isSuccessful": false}
        }

        // check the next event

        var currentEvents = this.patternEvents[this.index]
        for (let i = 0; i < currentEvents.length; i++) {
            var currentEvent = currentEvents[i]
            var result = this.checkOneEventOption(newEvent, currentEvent)
            var isMatchOneEventOption = false
            if (result["isMatch"]) {
                // match all the conditions: character, log, time limit, unless
                // match the new event
                isMatchOneEventOption = true
                if (result["isEnd"]){
                    // if meet some conditions: unless
                    return {"isEnd": result["isEnd"], "isSuccessful": result["isSuccessful"]}
                } else {
                    // so add the event index to the list, and move to next condition check
                    this.eventIdxs.push(i)
                }     
                break
            }
        }

        if (!isMatchOneEventOption) {
            return {"isEnd": false, "isSuccessful": false}
        }

        // check time limit
        if (newEvent["T"] > this.startTime + this.timeLimit) {
            return {"isEnd": true, "isSuccessful": false}
        }

        if (this.index >= this.totalEventsNum) {
            return {"isEnd": true, "isSuccessful": true}
        }

        return {"isEnd": false, "isSuccessful": false}
    }

    checkOneEventOption(newEvent, currentEvent){

        /////TO DO : character 怎么确认是同个event？？？？？？？如果有新的character involve进来呢？

        if (currentEvent["char1Idx"] != undefined && this.actors[currentEvent["char1Idx"]] != newEvent["N1"]) {
            return {"isMatch": false, "isEnd": false, "isSuccessful": false}
        }

        if (currentEvent["char2Idx"] != undefined && this.actors[currentEvent["char2Idx"]] != newEvent["N2"]) {
            return {"isMatch": false, "isEnd": false, "isSuccessful": false}
        }

        if (newEvent["L"] != currentEvent["tag"]) {
            return {"isMatch": false, "isEnd": false, "isSuccessful": false}
        }

        if (this.checkUnless(newEvent)) {
            return {"isMatch": true, "isEnd": true, "isSuccessful": false}
        }
        
        if (newEvent["L"] == currentEvent["tag"]){
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

            return {"isMatch": true, "isEnd": false, "isSuccessful": false}
        }

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
        if (this.meetUnlessForeverConditionTimes > 1) {return true}

        if (this.highLevelEventJson["unless_forever"] != undefined){
            for (let i = 0; i < this.highLevelEventJson["unless_forever"].length; i++){
                var currentEvent = this.highLevelEventJson["unless_forever"][i]
                // console.log(newEvent["L"] + " " + currentEvent["tag"])
                if (newEvent["L"] == currentEvent["tag"]){
                    if (currentEvent["char1Idx"] == undefined || this.actors[currentEvent["char1Idx"]] == newEvent["N1"]) {
                        if (currentEvent["char2Idx"] == undefined || this.actors[currentEvent["char2Idx"]] == newEvent["N2"]) {
                            this.meetUnlessForeverConditionTimes ++
                            return this.meetUnlessForeverConditionTimes > 1                           
                        }
                    }
                }
            }
        }
        // console.log("isMeetUnlessForever " + this.isMeetUnlessForeverFirstCondition)
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