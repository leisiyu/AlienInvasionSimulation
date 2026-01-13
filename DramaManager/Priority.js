/// Priority for orders
const OrderData = require('./DramaManagerData.js')

const WEIGHT_LAST_ISSUED = 100
const WEIGHT_ISSUED_TIMES = 50

function calculatePriority(order, agent, target, time){
    var priorityValue = 0
    if (checkIsIssuedLastTime(order, agent, target, time)) {
        priorityValue = priorityValue + WEIGHT_LAST_ISSUED
    }

    priorityValue = priorityValue + calculateIssuedTimesWeight(order)

    return priorityValue
}

function calculateIssuedTimesWeight(order){
    var totalEvents = OrderData.getTotalIntervenedStoryCount()
    var currentTypeCount = OrderData.getIntervenedStoryCountByType(order.partialMatchType)
    var ratio = Math.log((totalEvents + 1) / (currentTypeCount + 1))
    console.log("issued times priority " + currentTypeCount + " " + ratio + " " + ratio * WEIGHT_ISSUED_TIMES)
    return ratio * WEIGHT_ISSUED_TIMES
}

function checkIsIssuedLastTime(order, agent, target, time){
    var executedOrders = OrderData.getExecutedOrders()
    for (let i = 0; i < executedOrders.length; i++){
        var record = executedOrders[i]
        if (record.time == time - 1
            && record.order.orderType == order.orderType
            && record.agentName == agent.charName
            && record.order.target.charName == target.charName
        ){
            return true
        }
    }
    return false
}

module.exports = {
    calculatePriority
}