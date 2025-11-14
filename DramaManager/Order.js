/// the order given to the agents
/// The order won't change characters' states
/// Only if the agent is in free states, the order will be executed

const ORDER_TYPE = {
    ATTACK: "ATTACK",
    MOVE: "MOVE",
    CHASE: "CHASE",
    HEAL: "HEAL",
    KILL: "KILLED"
}

class Order {
    
    constructor(orderType, target){
        this.orderType = orderType
        this.target = target
        this.count = 1
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
}



module.exports = {
    Order,
    ORDER_TYPE
}