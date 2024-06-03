const fs = require('node:fs')
const CharactersData = require('./Character/CharactersData')
const StorySifter = require("./StorySifter/Sifter")
const { info } = require('node:console')
const Config = require('./Config')
const Sifter = require('./StorySifter/Sifter')

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
Logger.info = function(infoJson){
    infoJson["id"] = Logger.generateUniqueID()
    StorySifter.sift(infoJson)
    this.logQueue.push(JSON.stringify(infoJson))
}

var id = 0
Logger.generateUniqueID = function(){
    id++
    return id
}

// example
// {
//     N: this.charName,
//     S: this.state.stateType,
//     P: this.position,
//     T: time
// }
// N for Name
// S for State 
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
        keyFrame[characters[i].charName] = {
            P: characters[i].position,
            S: characters[i].state.stateType,
        }
    }

    return JSON.stringify(keyFrame)
}

Logger.writeToFile = function(){
    var dirName = this.getDirName()

    var content = ""
    for (let i = 0; i < Logger.logQueue.length; i++){
        content = content + Logger.logQueue[i] + "\n"
    }
    
    fs.writeFileSync(dirName +'/Log.txt', content, (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
            // Logger.clearQueue()
            Logger.logQueue = []
        }
    }) 

    var statesContent = ""
    for (let i = 0; i < Logger.statesLogQueue.length; i++){
        statesContent = statesContent + Logger.statesLogQueue[i] + "\n"
    }

    fs.writeFileSync(dirName + '/StatesLog.txt', statesContent, (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
            // Logger.clearQueue()
            Logger.statesLogQueue = []
        }
    }) 
}

Logger.outputFinalResults = function(){
    var dirName = this.getDirName()
    if (!fs.existsSync(dirName)) {
        fs.mkdir(dirName, { recursive: true }, (err) => {
            if (err) throw err;
        })
    }
    var finalResults = Sifter.getFinalResults()
    fs.writeFileSync(dirName + '/Results.txt', finalResults, (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
        }
    }) 
}

Logger.clearQueue = function(){
    Logger.logQueue = []
    Logger.statesLogQueue = []
}

Logger.getDirName = function(){
    var dirName = __dirname + "/Map" + Config.MAP_SIZE[0] + "A" + Config.ALIENS_NUM + "S" + Config.SOLIDERS_NUM + "T" + Config.TOWNFOLKS_NUM

    if (!fs.existsSync( dirName)) {
        fs.mkdirSync(dirName, { recursive: true }, (err) => {
            if (err) throw err;
        })
    }

    return dirName
}

module.exports = {
    Logger,
}