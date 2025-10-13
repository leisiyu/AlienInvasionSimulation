const jssim = require('js-simulator')
const Logger = require("./Logger.js").Logger
// const {Worker, isMainThread, parentPort} = require('worker_threads')
const DramaManager = require("./DramaManager/DramaManager")
const Util = require("./Utils.js")

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
		
        if (Util.DOES_INTERVENTE){
            // Lazy require to avoid circular dependency during initialization
            const Pool = require('./StorySifter/Pool')
            DramaManager.checkPartialMatchPool(Pool.partialMatchPool)
        }

		// TEST: Count neutral agents each beat
		// Logger.countNeutralAgents(scheduler.current_time)
        
        if (scheduler.current_time == timeSteps){
            var endTime = Date.now()
            Logger.outputFinalResults(endTime - startTime, timeSteps)
            Logger.outputStableTestResults(endTime - startTime, timeSteps)
        }
	}
}

module.exports = {
    scheduler,
    updateEvents,
}