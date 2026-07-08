// used for storing every intervention
// issued how many times
// agent & target
// 

var InterventionTypeCount = {}
var IssuedOrderRecords = []
// If two orders issued to the same agent, the agent will only choose one to execute1
var ExecutedOrderRecords = []
// var intervenedStoryCount = 0
var intervenedCompletedStoryTypeCount = {}
var InterManifoldInterventionRecords = []

function SingleRecord(agentName, order, time) {
    this.agentName = agentName
    this.order = order,
    this.time = time
}

function recordIssuedOrder(agentName, order, time){
    var record = new SingleRecord(agentName, order, time)
    IssuedOrderRecords.push(record)
    // console.log("record order " + order.partialMatchType + " " + order.partialMatchId)
}

function recordExecutedOrders(agentName, order, time){
    var record = new SingleRecord(agentName, order, time)
    ExecutedOrderRecords.push(record)
    // console.log("record executed order: " + record.time + " " + agentName + " ")
}

function getTargetFromLastOrder(agent, order, time){
    if (order == null) {return}

    for (let i = 0; i < ExecutedOrderRecords.length; i++){
        var record = ExecutedOrderRecords[i]
        if (order.orderType == record.order.orderType
            && time - 1 == record.time
            && agent.charName == record.agentName 
        ){
            // console.log("hahahahahah   " + record.agentName + " " + record.order.target.charName + time)
            return record.order.target
        }
    }
    return
}

function updateIntervenedCompleteStoryType(storyType){
    if (intervenedCompletedStoryTypeCount[storyType] != null) {
        intervenedCompletedStoryTypeCount[storyType] ++
    } else {
        intervenedCompletedStoryTypeCount[storyType] = 1
    }
}

function getIntervenedStoryCountByType(storyType){
    return intervenedCompletedStoryTypeCount[storyType] || 0
}

function getIntervenedStoryDetails(){
    return intervenedCompletedStoryTypeCount
}

function getTotalIntervenedStoryCount(){
    var totalIntervenedStoryCount = 0

    for (var key in intervenedCompletedStoryTypeCount) {
        totalIntervenedStoryCount = totalIntervenedStoryCount + intervenedCompletedStoryTypeCount[key]
    }

    return totalIntervenedStoryCount
}

function getIntervenedPartialStoryNumber(){
    var intervenedPartialStoryId = []
    for (let i = 0; i < ExecutedOrderRecords.length; i++) {
        var order = ExecutedOrderRecords[i].order
        if (order.partialMatchId != null) {
            intervenedPartialStoryId.push(order.partialMatchId)
        }
    }
    return intervenedPartialStoryId.length
}


// TODO: have a check if only sub-sub events was intervened?
function checkIsIntervenedStory(partialMatch){
    for (let i = 0; i < ExecutedOrderRecords.length; i++) {
        var order = ExecutedOrderRecords[i].order
        // console.log("check is intervened" + order.partialMatchId + " " + partialMatch.matchId)
        if (order.partialMatchId === partialMatch.matchId) {

            return true
        }
    }
    return false
}

// function checkIsIntervened(partialMatchId){
//     // story level
//     if (checkIsIntervenedStory(partialMatchId)) {
//         return true
//     }
    
//     // high-level

// }

function getExecutedOrders(){
    return ExecutedOrderRecords
}

function getIssuedOrderNumber(){
    return IssuedOrderRecords.length
}

function getExecutedOrderNumber(){
    return ExecutedOrderRecords.length
}

function getIssuedOrders(){
    return IssuedOrderRecords
}

//------ Inter-manifold intervention records ------
// function InterManifoldSingleRecord(objectName, objectType, time) {
//     this.objectName = objectName
//     this.objectType = objectType,
//     this.time = time
// } 

function recordInterManifoldIntervention(object){
    InterManifoldInterventionRecords.push(object)
}

function getInterManifoldInterventionRecords(){
    return InterManifoldInterventionRecords
}

function checkIsObjectCreatedBefore(object){
    for (let i = 0; i < InterManifoldInterventionRecords.length; i++) {
        var record = InterManifoldInterventionRecords[i]
        if (record.partialMatchId == object.partialMatchId && record.partialMatchType == object.partialMatchType) {
            return true
        }
    }
    return false
}

function getInterManifoldInterventionCountByType(objType){
    var count = 0
    for (let i = 0; i < InterManifoldInterventionRecords.length; i++) {
        var record = InterManifoldInterventionRecords[i]
        if (record.objectType == objType) {
            count++
        }
    }
    return count
}
//------ Inter-manifold intervention records ------

function checkIsInterManifoldIntervened(actors){
    const CharactersData = require("../Character/CharactersData.js")
    for (let i = 0; i < actors.length; i++) {
        var actor = actors[i]
        if (CharactersData.checkIsNewAddedAgent(actor)) {
            return true
        }
    }
    return false
}

module.exports = {
    recordIssuedOrder,
    recordExecutedOrders,
    getTargetFromLastOrder,
    checkIsIntervenedStory,
    updateIntervenedCompleteStoryType,
    getTotalIntervenedStoryCount,
    getExecutedOrders,
    getIntervenedStoryCountByType,
    getIssuedOrderNumber,
    getExecutedOrderNumber,
    getIssuedOrders,
    getIntervenedStoryDetails,
    recordInterManifoldIntervention,
    getInterManifoldInterventionRecords,
    checkIsObjectCreatedBefore,
    getInterManifoldInterventionCountByType,
    getIntervenedPartialStoryNumber,
    checkIsInterManifoldIntervened
}