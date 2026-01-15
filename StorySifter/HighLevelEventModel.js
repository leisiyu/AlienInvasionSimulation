const HighLevelEventsPatterns = require("./HighLevelEvents.json")
// const HighLevelEventsPatterns = require("./HighLevelEventsTest.json")
const SifterUtil = require("./SifterUtil")
const Utils = require("../Utils")
const CharacterData = require("../Character/CharactersData")

class HighLevelEvent {
    constructor(eventName, newEvent, firstEventIdx, highLevelEventJson, matchId){
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
        this.type = highLevelEventJson["type"]
        this.matchId = matchId

        this.checkUnlessForever(newEvent)
    }

    // check if there's a partial match already in the pool
    // with the same characters and log
    // this function does not check the newest event in the event list
    // (no need to be repeat, for example: lucky_kill)
    checkIsNewEventBelongsToThisMatch(newEvent){
        for (let i = 0; i < this.index; i++){
            var possibleEventList = this.patternEvents[i]
            for (let j = 0; j < possibleEventList.length; j++) {
                var currentEvent = possibleEventList[j]
                if (newEvent["L"] == currentEvent["tag"]
                    && (currentEvent["char1Idx"] == undefined 
                        || (newEvent["N1"] == this.actors[currentEvent["char1Idx"]["index"]]
                            && SifterUtil.checkCharacterType(this.actors[currentEvent["char1Idx"]["index"]], currentEvent["char1Idx"]["type"])))
                    && (currentEvent["char2Idx"] == undefined 
                        || (newEvent["N2"] == this.actors[currentEvent["char2Idx"]["index"]]
                            && SifterUtil.checkCharacterType(this.actors[currentEvent["char2Idx"]["index"]], currentEvent["char2Idx"]["type"])))
                    ){
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
                // var event = this.patternEvents[i][this.eventIdxs[i]]
                var possibleEventList = this.patternEvents[i]
                for (let j = 0; j < possibleEventList.length; j++) {
                    var event = possibleEventList[j]
                    if (event["repeat"]
                    && (event["char1Idx"] == undefined 
                        || (newEvent["N1"] == this.actors[event["char1Idx"]["index"]]
                            && SifterUtil.checkCharacterType(this.actors[event["char1Idx"]["index"]], event["char1Idx"]["type"]))
                    && (event["char2Idx"] == undefined 
                        || (newEvent["N2"] == this.actors[event["char2Idx"]["index"]])
                            && SifterUtil.checkCharacterType(this.actors[event["char2Idx"]["index"]], event["char2Idx"]["type"]))
                    && newEvent["L"] == event["tag"])) {
                        this.eventIDs.push(newEvent["id"])
                        return {"isEnd": false, "isSuccessful": false}
                    }
                }
                
        }

        this.checkUnlessForever(newEvent)
        if (this.meetUnlessForeverConditionTimes > 1){
            return {"isEnd": false, "isSuccessful": false}
        }

        // check the next event
        // if (this.eventName == "Interrupt_the_treatment") {
        //     console.log("hahaha " + newEvent["N1"]  + newEvent["L"] + newEvent["N2"] + " " + this.actors)
        // }
        var currentEvents = this.patternEvents[this.index]
        var isMatchOneEventOption = false
        for (let i = 0; i < currentEvents.length; i++) {
            var currentEvent = currentEvents[i]
            var result = this.checkOneEventOption(newEvent, currentEvent)
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
        // if (this.eventName == "vigilante") {
        //     console.log("hahaha222 " + this.eventIDs + " " + this.index + " " + this.totalEventsNum)
        // }
        if (!isMatchOneEventOption) {
            return {"isEnd": false, "isSuccessful": false}
        }

        // check time limit
        if (newEvent["T"] > this.startTime + this.timeLimit && this.meetUnlessForeverConditionTimes <= 1) {
            return {"isEnd": true, "isSuccessful": false}
        }

        if (this.index >= this.totalEventsNum) {
            return {"isEnd": true, "isSuccessful": true}
        }

        return {"isEnd": false, "isSuccessful": false}
    }

    checkOneEventOption(newEvent, currentEvent){

        /////TO DO : character 怎么确认是同个event？？？？？？？如果有新的character involve进来呢？

        if (currentEvent["char1Idx"] != undefined 
            && this.actors[currentEvent["char1Idx"]["index"]] != null 
            && (this.actors[currentEvent["char1Idx"]["index"]] != newEvent["N1"]
                || !SifterUtil.checkCharacterType(this.actors[currentEvent["char1Idx"]["index"]], currentEvent["char1Idx"]["type"]))) {
        // if (currentEvent["char1Idx"] != undefined && this.actors[currentEvent["char1Idx"]["index"]] != newEvent["N1"]) {
            return {"isMatch": false, "isEnd": false, "isSuccessful": false}
        } 

        // if (currentEvent["char2Idx"] != undefined && this.actors[currentEvent["char2Idx"]["index"]] != newEvent["N2"]) {
        if (currentEvent["char2Idx"] != undefined 
            && this.actors[currentEvent["char2Idx"]["index"]] != null 
            && (this.actors[currentEvent["char2Idx"]["index"]] != newEvent["N2"]
                || !SifterUtil.checkCharacterType(this.actors[currentEvent["char2Idx"]["index"]], currentEvent["char2Idx"]["type"]))
            ) {
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
            if (currentEvent["char1Idx"] != undefined 
                && typeof this.actors[currentEvent["char1Idx"]["index"]] === "undefined" 
                && newEvent["N1"] != ""
                && SifterUtil.checkCharacterType(newEvent["N1"], currentEvent["char1Idx"]["type"])) {
                this.actors.push(newEvent["N1"])
            }
            if (currentEvent["char2Idx"] != undefined 
                && typeof this.actors[currentEvent["char2Idx"]["index"]] === "undefined" 
                && newEvent["N2"] != ""
                && SifterUtil.checkCharacterType(newEvent["N2"], currentEvent["char2Idx"]["type"])) {
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
                if (currentUnlessEvent["char1Idx"] == undefined
                    ||(this.actors[currentUnlessEvent["char1Idx"]["index"]] == undefined && this.actors.indexOf(newEvent["N1"]) == -1)
                    ||(this.actors[currentUnlessEvent["char1Idx"]["index"]] != undefined && this.actors[currentUnlessEvent["char1Idx"]["index"]] == newEvent["N1"])) {
                    
                        if (currentUnlessEvent["char2Idx"] == undefined 
                        || (this.actors[currentUnlessEvent["char2Idx"]["index"]] == undefined && this.actors.indexOf(newEvent["N2"]) == -1)
                        || (this.actors[currentUnlessEvent["char2Idx"]["index"]] != undefined && this.actors[currentUnlessEvent["char2Idx"]["index"]] == newEvent["N2"])) {
                            // TO DO: difficult to test
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
                
                if (newEvent["L"] == currentEvent["tag"]){
                    if (currentEvent["char1Idx"] == undefined || this.actors[currentEvent["char1Idx"]["index"]] == newEvent["N1"]) {
                        if (currentEvent["char2Idx"] == undefined || this.actors[currentEvent["char2Idx"]["index"]] == newEvent["N2"]) {
                            this.meetUnlessForeverConditionTimes ++
                            return this.meetUnlessForeverConditionTimes > 1                           
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

    getNextEvents(){
        if (this.index >= this.totalEventsNum) {
            return null
        } else {
            var eventList = []
            for (let i = 0; i < this.patternEvents[this.index].length; i++) {
                // console.log("actorsssss " + this.actors[this.patternEvents[this.index][i]["char1Idx"] != undefined ? this.patternEvents[this.index][i]["char1Idx"]["index"] : ""])
                eventList.push({"N1": this.actors[this.patternEvents[this.index][i]["char1Idx"] != undefined ? this.patternEvents[this.index][i]["char1Idx"]["index"] : ""],
                                "N2": this.actors[this.patternEvents[this.index][i]["char2Idx"] != undefined ? this.patternEvents[this.index][i]["char2Idx"]["index"] : ""],
                                "L": this.patternEvents[this.index][i]["tag"],})
            }
            return eventList
        }
    }

    checkActorState(){
        for (let i = 0; i < this.actors.length; i++){
            var actor = CharacterData.getCharacterByName(this.actors[i])
            // console.log("actor " + i + " " + actor.charName)
            // if it's a weapon name, "getCharacterByName" will return null
            if (actor != null && actor.state.stateType == Utils.CHARACTER_STATES.DIED){
                // can be returned to the previous state
                if (this.highLevelEventJson["roll_back_check"].length > 0 && this.highLevelEventJson["roll_back_check"].indexOf(i) == -1) {
                    var result = this.rollBack(i)
                    return result
                }
            }
        }
        return SifterUtil.ROLL_BACK_TYPE.NONE
    }

    rollBack(actorIdx){
        for (let i = 0; i < this.index; i++){
            // if this character is not involved in a "kill" event
            // roll back to this stage
            var currentEventList = this.patternEvents[i]
            for (let j = 0; j < currentEventList.length; j++){
                var currentEvent = currentEventList[j]
                if ((currentEvent["char1Idx"] != undefined && actorIdx == currentEvent["char1Idx"]["index"]) 
                    || (currentEvent["char2Idx"] != undefined && actorIdx == currentEvent["char2Idx"]["index"])){
                    if (currentEvent["tag"] != "is killed by"){
                        // console.log("hahahah  index " + this.index + i)
                        this.index = i
                        if (this.index <= 0){
                            return SifterUtil.ROLL_BACK_TYPE.DELETE
                        } else {
                            this.actors = this.actors.slice(0, actorIdx)
                            return SifterUtil.ROLL_BACK_TYPE.ROLL_BACK
                        }
                        
                    }
                }
            }
        }
        return SifterUtil.ROLL_BACK_TYPE.NONE
    }

}

module.exports = {
    HighLevelEvent,
}