const fs = require('node:fs')

var partialMatchPool = []
const poolSize = 5000


function addIntoPool(event){
    partialMatchPool.push(event)
    console.log("partial matches num: " + partialMatchPool.length)
}

function updatePool(newEvent){
    var newPool = []
    for (let i = 0; i < partialMatchPool.length; i++) {
        var obj = partialMatchPool[i]
        var result = obj.checkNewEvent(newEvent)
        if (!result["isEnd"]) {
            newPool.push(obj)
        }

        if (result["isSuccessful"]) {
            eventFinish(obj.getJson())
        }
    }
    partialMatchPool = newPool

    console.log("pool " + partialMatchPool.length)
}

function eventFinish(highLevelEventJson){

    fs.writeFileSync('./HighLevelEventsLog.txt', JSON.stringify(highLevelEventJson) + "\n", (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
        }
    }) 
}



module.exports = {
    addIntoPool,
    partialMatchPool,
    updatePool,
}