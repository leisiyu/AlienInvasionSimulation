const jssim = require('js-simulator')

var rank = 1; // the higher the rank, the higher the priority assigned and the higher-rank event will be fired first for all events occurring at the same time interval
var evt1 = new jssim.SimEvent(rank);
evt1.id = 20
evt1.update = function(deltaTime){
    console.log("send message " + evt2.guid())
    console.log("this is ? " + this.rank)
    this.sendMsg(evt2.guid(), {
        content: "Hello"
    })

    var messages = this.readInBox();
    for(var i = 0; i < messages.length; ++i){
        var msg = messages[i];
        var sender_id = msg.sender;
        var recipient_id = msg.recipient; // should equal to this.guid()
        var time = msg.time;
        var rank = msg.rank; // the messages[0] contains the highest ranked message and last messages contains lowest ranked
        var content = msg.content; // for example the "Hello" text from the sendMsg code above
        // if (recipient_id == this.guid()){
            console.log("content: " + content)
        // }
    }
}

var rank = 2; // the higher the rank, the higher the priority assigned and the higher-rank event will be fired first for all events occurring at the same time interval
var evt2 = new jssim.SimEvent(rank);
evt2.id = 20
evt2.update = function(deltaTime){
    console.log("this is ? ? " + this.rank)
    this.sendMsg(evt1.guid(), {
        content: "Hello"
    })

    var messages = this.readInBox();
    console.log("message", messages.length)
    for(var i = 0; i < messages.length; ++i){
        var msg = messages[i];
        var sender_id = msg.sender;
        var recipient_id = msg.recipient; // should equal to this.guid()
        var time = msg.time;
        var rank = msg.rank; // the messages[0] contains the highest ranked message and last messages contains lowest ranked
        var content = msg.content; // for example the "Hello" text from the sendMsg code above
        console.log("content2: " + content)
    }
}

module.exports = {
    evt1,
    evt2,
}