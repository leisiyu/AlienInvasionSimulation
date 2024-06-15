const jssim = require('js-simulator')
const Logger = require("./Logger.js").Logger
// const {Worker, isMainThread, parentPort} = require('worker_threads')

var scheduler = new jssim.Scheduler();

function updateEvents(totalTimeSteps){
    // while(scheduler.hasEvents()) {
    var timeSteps = 5000

    var startTime = Date.now()

    if (totalTimeSteps != null) {timeSteps = totalTimeSteps}
    while(scheduler.current_time <= timeSteps){
        if (Logger.logQueue.length > 0){
            Logger.writeToFile()
        }
		scheduler.update()
        
        if (scheduler.current_time == 5000){
            var endTime = Date.now()
            Logger.outputFinalResults(endTime - startTime, timeSteps)
        }
	}
}

module.exports = {
    scheduler,
    updateEvents,
}