const fs = require('node:fs')

var partialMatchPool = []
const poolSize = 5000


function addIntoPool(event){
    partialMatchPool.push(event)
    console.log("partial matches num: " + partialMatchPool.length)
}

function updatePool(newEvent){
    var removedEventsPool = []
    for (let i = 0; i < partialMatchPool.length; i++) {
        var obj = partialMatchPool[i]
        var result = obj.checkNewEvent(newEvent)
        if (result["isEnd"]) {

            removedEventsPool.push(obj)
            console.log("new pool length " + removedEventsPool.length)
            console.log("is End!!!" + JSON.stringify(obj.getJson()) + " " + i)
        }

        if (result["isSuccessful"]) {
            eventFinish(obj.getJson())
        }
    }
    
    for (let i = 0; i < removedEventsPool.length; i++){
        var index = partialMatchPool.indexOf(removedEventsPool[i])
        if (index != -1){
            partialMatchPool.splice(index, 1)
        }
    }

    console.log("pool " + partialMatchPool.length)
}

function eventFinish(highLevelEventJson){

    fs.writeFileSync('./HighLevelEventsLog.txt', JSON.stringify(highLevelEventJson) + "\n", {flag: 'a'}, (err) => { 
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