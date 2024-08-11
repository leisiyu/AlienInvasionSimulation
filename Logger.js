const fs = require('node:fs')
const CharactersData = require('./Character/CharactersData')
const StorySifter = require("./StorySifter/Sifter")
const { info } = require('node:console')
// const Config = require('./Config')
const Utils = require('./Utils')
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

Logger.outputFinalResults = function(excutionTime, timeSteps){
    var dirName = this.getDirName()
    if (!fs.existsSync(dirName)) {
        fs.mkdir(dirName, { recursive: true }, (err) => {
            if (err) throw err;
        })
    }
    var finalResults = "Total events number: " + (this.generateUniqueID() - 1) + '\n'
    finalResults = finalResults + Sifter.getFinalResults()
    finalResults = finalResults + "Excution time: " + excutionTime + '\n'
    finalResults = finalResults + "Simulation time: " + timeSteps + '\n'
    fs.writeFileSync(dirName + '/Results.txt', finalResults, (err) => { 
        // In case of a error throw err. 
        if (err) throw err;
        else {
            console.log('successful')
        }
    }) 
}

Logger.outputStableTestResults = function(excutionTime, timeSteps){
    var results = Sifter.getFinalResultsJson()
    results["excutionTime"] = excutionTime
    results["total"] = (this.generateUniqueID() - 1)
    results["simulationTime"] = timeSteps

    var mid =  Utils.MAP_SIZE[0] + "." + Utils.MAP_SIZE[1] + "C" + Utils.TOTAL_CHARACTERS
    // fs.writeFileSync(__dirname + "/SimulatorTime/" + Utils.TIME_STEPS + ".txt", JSON.stringify(results) + "\n", {flag: 'a'}, (err) => {
    fs.writeFileSync(__dirname + "/StableTest/" + mid + ".txt", JSON.stringify(results) + "\n", {flag: 'a'}, (err) => {
    // fs.writeFileSync(__dirname + "/Ratio/" + JSON.stringify(Utils.CHARACTER_RATIO) + ".txt", JSON.stringify(results) + "\n", {flag: 'a'}, (err) => {
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

var dirNameIdx = ""
Logger.getDirName = function(){
    // var dirName = __dirname + "/Map" + Utils.MAP_SIZE[0] + "A" + Utils.ALIENS_NUM + "S" + Utils.SOLIDERS_NUM + "T" + Utils.TOWNFOLKS_NUM
    var dirName = __dirname + "/StableTest/M" + Utils.MAP_SIZE[0] + "." + Utils.MAP_SIZE[1] + "C" + Utils.TOTAL_CHARACTERS + "/" + dirNameIdx
    // var dirName = __dirname + "/Ratio/" + JSON.stringify(Utils.CHARACTER_RATIO) + "/" + dirNameIdx
    // var dirName = __dirname + "/SimulatorTime/" + Utils.TIME_STEPS + "/" + dirNameIdx


    if (!fs.existsSync( dirName)) {
        fs.mkdirSync(dirName, { recursive: true }, (err) => {
            if (err) throw err;
        })
    }

    return dirName
}

Logger.setDirNameIdx = function(idx){
    dirNameIdx = idx
}

module.exports = {
    Logger,
}