const jssim = require('js-simulator')
const Logger = require("./Logger.js").Logger
// const {Worker, isMainThread, parentPort} = require('worker_threads')
const DramaManager = require("./DramaManager/DramaManager")
const Util = require("./Utils.js")
const Pool = require("./StorySifter/Pool")
const ClarkEvans = require("./Aggregation/ClarkEvansAggregation.js")
// const PCF = require("./Aggregation/PairCorrelationFunction.js")

var scheduler = new jssim.Scheduler();

function updateEvents(totalTimeSteps){
    // while(scheduler.hasEvents()) {
    var timeSteps = 2000

    var startTime = Date.now()

    ClarkEvans.resetAggregatedRResults()
    // PCF.resetAggregatedPCFResults()

    if (totalTimeSteps != null) {timeSteps = totalTimeSteps}
    while(scheduler.current_time <= timeSteps){
        if (Logger.logQueue.length > 0){
            Logger.writeToFile()
        }
		scheduler.update()

        // record Clark–Evans R each beat
        ClarkEvans.recordAggregation(scheduler.current_time)

        // record PCF g(r) each beat with binWidth = 3
        // PCF.recordAggregation(scheduler.current_time, { binWidth: 5 })
        if (Util.INTRA_MANIFOLD_AB_ENABLED || Util.INTER_MANIFOLD_ENABLED){
            // Lazy require to avoid circular dependency during initialization
            const Pool = require('./StorySifter/Pool')
            DramaManager.checkPartialMatchPool(Pool.partialMatchPool, scheduler.current_time)

            if (Util.INTER_MANIFOLD_ENABLED) {
                // add object in each beat
                DramaManager.addObjectOnMap()
            }

        }
        Logger.recordPopulationInfo()

		// TEST: Count neutral agents each beat
		// Logger.countNeutralAgents(scheduler.current_time)

        // clean up the sifter pool
        Pool.cleanUpPool(scheduler.current_time)
        
        if (scheduler.current_time == timeSteps){
            var endTime = Date.now()
            Logger.outputFinalResults(endTime - startTime, timeSteps)
            Logger.outputStableTestResults(endTime - startTime, timeSteps)

            Logger.outputOrderResults()

            var averageR = ClarkEvans.getAverageR()
            console.log('Average Clark–Evans R:', averageR)

            // var averagePCF = PCF.getAverageG()
            // console.log('Average PCF radii:', averagePCF.radii)
            // console.log('Average PCF g:', averagePCF.g)

            Logger.writePopulationInfoToFile()
        }
	}
}

module.exports = {
    scheduler,
    updateEvents,
}