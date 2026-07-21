// used for storing every intervention
// issued how many times
// agent & target
// 

var InterventionTypeCount = {}
var IssuedOrderRecords = []
// If two orders issued to the same agent, the agent will only choose one to execute1
var ExecutedOrderRecords = []
// var intervenedStoryCount = 0
var InterNewObjects = []
var totalIntervenedCompletedStoryTypeCount = {}
var InterManifoldInterventionRecords = []
var InterManifoldCompletedInterventionRecords = []
var IntraManifoldInterventionRecords = []
var IntraManifoldCompletedInterventionRecords = []

var successfulInterManifoldInterventionRecords = []
var successfulIntraManifoldInterventionRecords = []

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

// For all types of interventions
function updateIntervenedCompleteStoryType(storyType, isIntra = true){
    if (totalIntervenedCompletedStoryTypeCount[storyType] != null) {
        totalIntervenedCompletedStoryTypeCount[storyType] ++
    } else {
        totalIntervenedCompletedStoryTypeCount[storyType] = 1
    }
}

function getIntervenedCompleteStoryCountByType(storyType){
    return totalIntervenedCompletedStoryTypeCount[storyType] || 0
}

function getIntervenedCompletedStoryDetails(){
    return totalIntervenedCompletedStoryTypeCount
}

function getTotalIntervenedStoryCount(){
    var totalIntervenedStoryCount = 0

    for (var key in totalIntervenedCompletedStoryTypeCount) {
        totalIntervenedStoryCount = totalIntervenedStoryCount + totalIntervenedCompletedStoryTypeCount[key]
    }

    return totalIntervenedStoryCount
}

// function getIntraIntervenedPartialStoryNumber(){
//     var intervenedPartialStoryId = []
//     for (let i = 0; i < ExecutedOrderRecords.length; i++) {
//         var order = ExecutedOrderRecords[i].order
//         if (order.partialMatchId != null) {
//             intervenedPartialStoryId.push(order.partialMatchId)
//         }
//     }
//     return intervenedPartialStoryId.length
// }


// Not in use now
// function checkIsIntraIntervenedStory(partialMatch){
//     for (let i = 0; i < ExecutedOrderRecords.length; i++) {
//         var order = ExecutedOrderRecords[i].order
//         // console.log("check is intervened" + order.partialMatchId + " " + partialMatch.matchId)
//         if (order.partialMatchId === partialMatch.matchId) {

//             return true
//         }
//     }
//     return false
// }

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

//------ Intra-manifold intervention records ------
// record a new intra-manifold intervention, not a completed one
// object is a partial match object
function recordIntraManifoldIntervention(object){
    if (IntraManifoldInterventionRecords.indexOf(object) == -1) {
        IntraManifoldInterventionRecords.push(object)
    }
}

function getIntraManifoldInterventionRecords(){
    return IntraManifoldInterventionRecords
}

function getIntraManifoldInterventionCount(){
    return IntraManifoldInterventionRecords.length
}

function recordIntraManifoldCompletedIntervention(object){
    IntraManifoldCompletedInterventionRecords.push(object)
}

function getIntraManifoldCompletedInterventionRecords(){
    return IntraManifoldCompletedInterventionRecords
}

function getIntraManifoldCompletedInterventionCount(){
    return IntraManifoldCompletedInterventionRecords.length
}
//------ Inter-manifold intervention records ------

//------ Inter-manifold intervention records ------
// function InterManifoldSingleRecord(objectName, objectType, time) {
//     this.objectName = objectName
//     this.objectType = objectType,
//     this.time = time
// } 

// objectType: agent or gear
// objectSubType: agent type or gear type
// objectName: agent name or gear name
// partialMatchId: partial match id
// partialMatchType: partial match event name
function SingleInterObject(objectType, objectSubType, objectName, partialMatchId, partialMatchEventName){
    this.objectType = objectType
    this.objectSubType = objectSubType
    this.objectName = objectName
    this.partialMatchId = partialMatchId
    this.partialMatchEventName = partialMatchEventName
}

// record a new inter-manifold intervention, not a completed one
// object is SingleInter  object
function recordInterManifoldIntervention(object){
    // for (let i = 0; i < InterManifoldInterventionRecords.length; i++) {
    //     var record = InterManifoldInterventionRecords[i]
    //     if (record.partialMatchId == object.partialMatchId && record.partialMatchEventName == object.partialMatchEventName) {
    //         return 
    //     }
    // }
    if (checkIsObjectCreatedBefore(object)) {
        return
    }
    InterManifoldInterventionRecords.push(object)
}

function getInterManifoldInterventionRecords(){
    return InterManifoldInterventionRecords
}

function checkIsObjectCreatedBefore(object){
    for (let i = 0; i < InterManifoldInterventionRecords.length; i++) {
        var record = InterManifoldInterventionRecords[i]
        if (record.partialMatchId == object.partialMatchId && record.partialMatchEventName == object.partialMatchEventName) {
            return true
        }
    }
    return false
}

function getInterManifoldInterventionCountByType(objType){
    var count = 0
    for (let i = 0; i < InterManifoldInterventionRecords.length; i++) {
        var record = InterManifoldInterventionRecords[i]
        if (objType == null || record.objectType == objType) {
            count++
        }
    }
    return count
}

function recordInterManifoldCompletedIntervention(object){
    InterManifoldCompletedInterventionRecords.push(object)
}

function getInterManifoldCompletedInterventionRecords(){
    return InterManifoldCompletedInterventionRecords
}

function getInterManifoldCompletedInterventionCount(){
    return InterManifoldCompletedInterventionRecords.length
}

// agent or gear
function recordInterNewObject(object){
    InterNewObjects.push(object)
}

function getInterNewObjectNumberByType(objType){
    var objects = []
    for (let i = 0; i < InterNewObjects.length; i++) {
        var object = InterNewObjects[i]
        if (object.objectType == objType) {
            objects.push(object)
        }
    }
    return objects.length
}
//------ Inter-manifold intervention records ------


function checkIsInterManifoldIntervenedByNewAgent(actors){
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
    // checkIsIntraIntervenedStory,
    updateIntervenedCompleteStoryType,
    getTotalIntervenedStoryCount,
    getExecutedOrders,
    getIntervenedCompleteStoryCountByType,
    getIssuedOrderNumber,
    getExecutedOrderNumber,
    getIssuedOrders,
    getIntervenedCompletedStoryDetails,
    recordInterManifoldCompletedIntervention,
    recordInterManifoldIntervention,
    getInterManifoldInterventionRecords,
    checkIsObjectCreatedBefore,
    getInterManifoldInterventionCountByType,
    // getIntraIntervenedPartialStoryNumber,
    checkIsInterManifoldIntervenedByNewAgent,
    recordIntraManifoldIntervention,
    recordIntraManifoldCompletedIntervention,
    getIntraManifoldInterventionRecords,
    getIntraManifoldInterventionCount,
    getIntraManifoldCompletedInterventionRecords,
    getIntraManifoldCompletedInterventionCount,
    getInterManifoldCompletedInterventionRecords,
    getInterManifoldCompletedInterventionCount,
    recordInterNewObject,
    getInterNewObjectNumberByType,
    SingleInterObject
}