/// the order given to the agents

const ORDER_TYPE = {
    ATTACK: "ATTACK",
    MOVE: "MOVE",
}

class Order {
    
    constructor(orderType, target){
        this.orderType = orderType
        this.target = target
        this.count = 1
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