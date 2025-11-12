// used for storing every intervention
// issued how many times
// agent & target
// 

var InterventionTypeCount = {}
var OrderRecords = []
function SingleRecord(order, time) {
    this.order = order,
    this.time = time
}

function recordOrder(order, time){
    var record = new SingleRecord(order, time)
    OrderRecords.push(record)
    console.log("record order " + record.time)
}


module.exports = {
    recordOrder,
}