// used for storing every intervention
// issued how many times
// agent & target
// 

var InterventionTypeCount = {}
var IssuedOrderRecords = []
// If two orders issued to the same agent, the agent will only choose one to execute1
var ExecutedOrderRecords = []   
// var CurrentOrders = []
var intervenedStoryCount = 0
var intervenedStoryTypeCount = {}

function SingleRecord(agentName, order, time) {
    this.agentName = agentName
    this.order = order,
    this.time = time
}

function recordIssuedOrder(agentName, order, time){
    var record = new SingleRecord(agentName, order, time)
    IssuedOrderRecords.push(record)
    console.log("record order " + record.time + " " + agentName)
}

function recordExecutedOrders(agentName, order, time){
    var record = new SingleRecord(agentName, order, time)
    ExecutedOrderRecords.push(record)
    console.log("record executed order: " + record.time + " " + agentName + " ")
}

function getTargetFromLastOrder(agent, order, time){
    if (order == null) {return}

    for (let i = 0; i < ExecutedOrderRecords.length; i++){
        var record = ExecutedOrderRecords[i]
        if (order.orderType == record.order.orderType
            && time - 1 == record.time
            && agent.charName == record.agentName 
        ){
            return record.order.target
        }
    }
    return
}


// function cleanUpCurrentOrders(){
//     CurrentOrders = []
// }

// function addCurrentOrder(order){
//     CurrentOrders.push(order)
// }

function updateIntervenedStoryType(storyType){
    if (intervenedStoryTypeCount[storyType] != null) {
        intervenedStoryTypeCount[storyType] ++
    } else {
        intervenedStoryTypeCount[storyType] = 1
    }
}

function addIntervenedStoryCount(){
    intervenedStoryCount ++ 
}

function getIntervenedStoryCount(){
    return intervenedStoryCount
}

function checkIsIntervened(partialMatch){
    for (let i = 0; i < IssuedOrderRecords.length; i++) {
        var order = IssuedOrderRecords[i].order
        if (order.partialMatchId == partialMatch.matchId) {
            return true
        }
    }
    return false
}

module.exports = {
    recordIssuedOrder,
    recordExecutedOrders,
    getTargetFromLastOrder,
    // cleanUpCurrentOrders,
    // addCurrentOrder,
    checkIsIntervened,
    updateIntervenedStoryType,
    addIntervenedStoryCount,
    getIntervenedStoryCount
}