// used for storing every intervention
// issued how many times
// agent & target
// 

var InterventionTypeCount = {}
var IssuedOrderRecords = []
// If two orders issued to the same agent, the agent will only choose one to execute1
var ExecutedOrderRecords = []
// var intervenedStoryCount = 0
var intervenedStoryTypeCount = {}

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

function updateIntervenedStoryType(storyType){
    if (intervenedStoryTypeCount[storyType] != null) {
        intervenedStoryTypeCount[storyType] ++
    } else {
        intervenedStoryTypeCount[storyType] = 1
    }
}

function getIntervenedStoryCountByType(storyType){
    return intervenedStoryTypeCount[storyType] || 0
}

function getIntervenedStoryDetails(){
    return intervenedStoryTypeCount
}

function getTotalIntervenedStoryCount(){
    var totalIntervenedStoryCount = 0

    for (var key in intervenedStoryTypeCount) {
        totalIntervenedStoryCount = totalIntervenedStoryCount + intervenedStoryTypeCount[key]
    }

    return totalIntervenedStoryCount
}


// TODO: have a check if only sub-sub events was intervened?
function checkIsIntervened(partialMatch){
    for (let i = 0; i < ExecutedOrderRecords.length; i++) {
        var order = ExecutedOrderRecords[i].order
        // console.log("check is intervened" + order.partialMatchId + " " + partialMatch.matchId)
        if (order.partialMatchId === partialMatch.matchId) {

            return true
        }
    }
    return false
}

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

module.exports = {
    recordIssuedOrder,
    recordExecutedOrders,
    getTargetFromLastOrder,
    checkIsIntervened,
    updateIntervenedStoryType,
    getTotalIntervenedStoryCount,
    getExecutedOrders,
    getIntervenedStoryCountByType,
    getIssuedOrderNumber,
    getExecutedOrderNumber,
    getIssuedOrders,
    getIntervenedStoryDetails
}