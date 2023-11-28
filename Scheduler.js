const jssim = require('js-simulator')

var scheduler = new jssim.Scheduler();

function updateEvents(){
    // while(scheduler.hasEvents()) {
    while(scheduler.current_time < 200000){
		scheduler.update();
	}
}

module.exports = {
    scheduler,
    updateEvents,
}