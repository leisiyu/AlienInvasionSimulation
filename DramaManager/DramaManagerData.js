// used for storing every intervention
// issued how many times
// agent & target
// 

var InterventionTypeCount = {}
var OrderRecords = []
function SingleRecord(agentName, order, time) {
    this.agentName = agentName
    this.order = order,
    this.time = time
}

function recordOrder(agentName, order, time){
    var record = new SingleRecord(agentName, order, time)
    OrderRecords.push(record)
    console.log("record order " + record.time + " " + agentName)
}

function checkOrdersInLastBeat(){

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

module.exports = {
    recordOrder,
    getTargetFromLastOrder
}