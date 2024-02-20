const fs = require('node:fs')
const CharactersData = require('./Character/CharactersData')

var Logger = {
    logQueue: [],
    statesLogQueue: [],
    index: 0,
}


// example:
// {
//     N1: this.charName,
//     L: "was chasing",
//     N2: character.charName,
//     T: time,
// }
// N1 for Name1
// L for Log
// N2 for Name2
// T for Time
Logger.info = function(infoStr){
    this.logQueue.push(infoStr)
}


// example
// {
//     N: this.charName,
//     A: "m",
//     P: this.position,
//     T: time
// }
// N for Name
// A for Action 
// P for Pos 
// T for Time
Logger.statesInfo = function(infoStr){
    this.statesLogQueue.push(infoStr)
    this.index++

    if(this.index % 1000 == 0) {
        this.statesLogQueue.push(this.setKeyFrame())
    }
}

Logger.setKeyFrame = function(){
    var keyFrame = {}
    keyFrame["frameType"] = "key"

    //characters' states
    var characters = CharactersData.charactersArray
    for (let i = 0; i < characters.length; i++){
        keyFrame[characters[i].charName] = characters[i].position
    }

    return JSON.stringify(keyFrame)
}

Logger.writeToFile = function(){
    var content = ""
    for (let i = 0; i < Logger.logQueue.length; i++){
        content = content + Logger.logQueue[i] + "\n"
    }
    
    fs.writeFileSync('./Log.txt', content, (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
            Logger.clearQueue()
        }
    }) 

    var statesContent = ""
    for (let i = 0; i < Logger.statesLogQueue.length; i++){
        statesContent = statesContent + Logger.statesLogQueue[i] + "\n"
    }

    fs.writeFileSync('./StatesLog.txt', statesContent, (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
            Logger.clearQueue()
        }
    }) 
}

Logger.clearQueue = function(){
    Logger.logQueue = []
    Logger.statesLogQueue = []
}

module.exports = {
    Logger,
}