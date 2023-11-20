const jssim = require('js-simulator')

var scheduler = new jssim.Scheduler();

function updateEvents(){
    while(scheduler.hasEvents()) {
		scheduler.update();
	}
}

module.exports = {
    scheduler,
    updateEvents,
}