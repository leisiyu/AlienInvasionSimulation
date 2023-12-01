const fs = require('node:fs')

var Logger = {
    logQueue: [],

}

Logger.info = function(infoStr){
    this.logQueue.push(infoStr)
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
}

Logger.clearQueue = function(){
    Logger.logQueue = []
}

module.exports = {
    Logger,
}