// used for storing every intervention
// issued how many times
// agent & target
// 

var InterventionTypeCount = {}
var OrderRecords = []
var CurrentOrders = []
var intervenedStoryCount = 0

function SingleRecord(agentName, order, time) {
    this.agentName = agentName
    this.order = order,
    this.time = time
}

function recordGivenOrder(agentName, order, time){
    var record = new SingleRecord(agentName, order, time)
    OrderRecords.push(record)
    console.log("record order " + record.time + " " + agentName)
}

function getTargetFromLastOrder(agent, order, time){
    if (order == null) {return}

    for (let i = 0; i < OrderRecords.length; i++){
        var record = OrderRecords[i]
        if (order.orderType == record.order.orderType
            && time - 1 == record.time
            && agent.charName == record.agentName 
        ){
            return record.order.target
        }
    }
    return
}


function cleanUpCurrentOrders(){
    CurrentOrders = []
}

function addCurrentOrder(order){
    CurrentOrders.push(order)
}

function calculateIssuedTimes(){

}

function addIntervenedStoryCount(){
    intervenedStoryCount ++ 
}

function getIntervenedStoryCount(){
    return intervenedStoryCount
}

function checkIsIntervened(partialMatch){
    for (let i = 0; i < OrderRecords.length; i++) {
        var order = OrderRecords[i].order
        if (order.partialMatchId == partialMatch.matchId) {
            return true
        }
    }
    return false
}

module.exports = {
    recordGivenOrder,
    getTargetFromLastOrder,
    cleanUpCurrentOrders,
    addCurrentOrder,
    checkIsIntervened,
    addIntervenedStoryCount,
    getIntervenedStoryCount
}