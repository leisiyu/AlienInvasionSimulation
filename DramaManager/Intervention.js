/// How to intervene in the story
/// Different types of interventions
/// 
const CharacterBase = require("../Character/CharacterBase.js")
const Order = require("./Order.js").Order
const ORDER_TYPE = require("./Order.js").ORDER_TYPE
const CharactersData = require("../Character/CharactersData.js")
const Utils = require('../Utils.js') 

function intervene(event, time){
    console.log("event log: " + event["L"] + event["N1"] + event["N2"])
    var agent = null
    if (event["N1"] != undefined) {
        agent = CharactersData.getCharacterByName(event["N1"])
    }
    
    var target = null
    if (event["N2"] != undefined) {
        target = CharactersData.getCharacterByName(event["N2"])
    }

    if (agent == null) {
        agent = CharacterBase.findEnemy(target)
    }
    
    switch (event["L"]){
        case "attacks":
        case "shoots":
            if (agent != null){
                orderAttack(agent, target, time)
            }
            // if agent is null, abandon this order 
            break;
        case "is chasing":    
            if (agent != null){
                orderChase(agent, target, time)
            }
            break;
        case "is healing":
            if (agent != null) {
                orderHeal(agent, target, time)
            }
            break;
        case "is killed by":
            if (agent != null){
                orderCriticalHit(agent, target, time)
            }
            
            break;
    }
}


/// Move A to B
function orderChase(agent, target, time){
    var order = new Order(ORDER_TYPE.MOVE, target)
    CharacterBase.addOrder(agent, target, order, time)
}

/// Attack target with critical hit
function orderCriticalHit(agent, target, time){
    /// attack the target with critical hit
    var order = new Order(ORDER_TYPE.KILL, target)
    CharacterBase.addOrder(agent, target, order, time)
}

function orderAttack(agent, target,time){
    /// attack the target
    var order = new Order(ORDER_TYPE.ATTACK, target)
    CharacterBase.addOrder(agent, target, order, time)
}

function orderHeal(agent, target, time){
    /// heal the target
    var order = new Order(ORDER_TYPE.HEAL, target)
    CharacterBase.addOrder(agent, target, order, time)
}



module.exports = {
    intervene,
}