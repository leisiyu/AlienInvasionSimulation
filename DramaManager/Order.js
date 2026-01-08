/// the order given to the agents
/// The order won't change characters' states
/// Only if the agent is in free states, the order will be executed

const ORDER_TYPE = {
    ATTACK: "ATTACK",
    MOVE: "MOVE",
    CHASE: "CHASE",
    HEAL: "HEAL",
    KILL: "KILL"
}

var orderIdx = 0
function generateUniqueID(){
    orderIdx++
    return orderIdx
}

class Order {
    
    constructor(orderType, target, partialMatchId, partialMatchType){
        this.orderType = orderType
        this.target = target
        this.count = 1
        this.partialMatchId = partialMatchId
        this.partialMatchType = partialMatchType
        this.orderId = generateUniqueID()
        this.priority = 0
    }

    updateTarget(newTarget){
        this.target = newTarget
    }

    isExecuted() {
        return this.count <= 0
    }

    excute(){
        this.count = this.count - 1
    }

    updatePriority(value){
        this.priority = value
    }
}



module.exports = {
    Order,
    ORDER_TYPE
}