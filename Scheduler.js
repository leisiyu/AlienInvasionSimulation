const jssim = require('js-simulator')
const Logger = require("./Logger.js").Logger
// const {Worker, isMainThread, parentPort} = require('worker_threads')

var scheduler = new jssim.Scheduler();

function updateEvents(){
    // while(scheduler.hasEvents()) {
    while(scheduler.current_time <= 5000){
        if (Logger.logQueue.length > 0){
            Logger.writeToFile()
        }
		scheduler.update()
        
        if (scheduler.current_time == 5000){
            Logger.outputFinalResults()
        }
	}
}

module.exports = {
    scheduler,
    updateEvents,
}