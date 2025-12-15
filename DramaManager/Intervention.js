/// How to intervene in the story
/// Different types of interventions
/// 
const CharacterBase = require("../Character/CharacterBase.js")
const Order = require("./Order.js").Order
const ORDER_TYPE = require("./Order.js").ORDER_TYPE
const CharactersData = require("../Character/CharactersData.js")
const Utils = require('../Utils.js') 

function intervene(event, partialMatchId, time){
    // console.log("event log: " + event["L"] + event["N1"] + event["N2"])
    var agent = null
    if (event["N1"] != undefined) {
        agent = CharactersData.getCharacterByName(event["N1"])
    }
    
    var target = null
    if (event["N2"] != undefined) {
        target = CharactersData.getCharacterByName(event["N2"])
    }
    
    switch (event["L"]){
        case "attacks":
        case "shoots":
            if (agent == null) {
                agent = CharacterBase.findEnemy(target)
            }

            if (agent != null){
                orderAttack(agent, target, partialMatchId, time)

            }
            // if agent is null, abandon this order 
            break;
        case "is chasing":  
            if (agent == null) {
                agent = CharacterBase.findEnemy(target)
            }
            if (agent != null){
                orderChase(agent, target, partialMatchId, time)
            }
            break;
        case "is healing":
            if (agent == null) {
                agent = CharacterBase.findAlly(target)
            }
            if (agent != null) {
                orderHeal(agent, target, partialMatchId, time)
            }
            break;
        case "is killed by":
            if (agent == null) {
                agent = CharacterBase.findEnemy(target)
            }
            if (target != null){
                orderCriticalHit(target, agent, partialMatchId, time)
            }
            
            break;
    }
}


/// Move A to B
function orderChase(agent, target, partialMatchId, time){
    var order = new Order(ORDER_TYPE.MOVE, target, partialMatchId)
    CharacterBase.addOrder(agent, target, order, time)
}

/// Attack target with critical hit
function orderCriticalHit(target, agent, partialMatchId, time){
    /// attack the agent with critical hit
    var order = new Order(ORDER_TYPE.KILL, agent, partialMatchId)
    CharacterBase.addOrder(target, agent, order, time)
}

function orderAttack(agent, target, partialMatchId, time){
    /// attack the target
    var order = new Order(ORDER_TYPE.ATTACK, target, partialMatchId)
    CharacterBase.addOrder(agent, target, order, time)
}

function orderHeal(agent, target, partialMatchId, time){
    /// heal the target
    var order = new Order(ORDER_TYPE.HEAL, target, partialMatchId)
    CharacterBase.addOrder(agent, target, order, time)
}



module.exports = {
    intervene,
}