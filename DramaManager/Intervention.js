/// How to intervene in the story
/// Different types of interventions
/// "agent": the one who carry out orders
/// "target": the entity on which the order is executed

const CharacterBase = require("../Character/CharacterBase.js")
const Order = require("./Order.js").Order
const ORDER_TYPE = require("./Order.js").ORDER_TYPE
const CharactersData = require("../Character/CharactersData.js")
const Utils = require('../Utils.js') 

function intervene(event, partialMatchId, partialMatchType, time){
    // console.log("event log: " + event["L"] + event["N1"] + event["N2"])
    var character1 = null
    if (event["N1"] != undefined) {
        character1 = CharactersData.getCharacterByName(event["N1"])
    }
    
    var character2 = null
    if (event["N2"] != undefined) {
        character2 = CharactersData.getCharacterByName(event["N2"])
    }
    var agent
    var target
    switch (event["L"]){
        case "attacks":
        case "shoots":
            agent = character1
            target = character2
            if (agent == null && target != null) {
                agent = CharacterBase.findEnemy(target)
            }

            if (agent != null){
                orderAttack(agent, target, partialMatchId, partialMatchType, time)

            }
            // if agent is null, abandon this order 
            break;
        case "is chasing":  
            agent = character1
            target = character2
            if (agent == null && target != null) {
                agent = CharacterBase.findEnemy(target)
            }
            if (agent != null){
                orderChase(agent, target, partialMatchId, partialMatchType, time)
            }
            break;
        case "is healing":
            agent = character1
            target = character2
            if (agent == null && target != null) {
                agent = CharacterBase.findAlly(target)
            }
            if (agent != null) {
                orderHeal(agent, target, partialMatchId, partialMatchType, time)
            }
            break;
        case "is killed by":
            agent = character2
            target = character1
            if (agent == null && target != null) {
                agent = CharacterBase.findEnemy(target)
            }
            if (agent != null){
                orderCriticalHit(agent, target, partialMatchId, partialMatchType, time)
            }
            
            break;
    }
}


/// Move A to B
function orderChase(agent, target, partialMatchId, partialMatchType, time){
    var order = new Order(ORDER_TYPE.MOVE, target, partialMatchId, partialMatchType)
    CharacterBase.addOrder(agent, target, order, time)
}

/// Attack target with critical hit
function orderCriticalHit(agent, target, partialMatchId, partialMatchType, time){
    /// attack the agent with critical hit
    var order = new Order(ORDER_TYPE.KILL, target, partialMatchId, partialMatchType)
    CharacterBase.addOrder(agent, target, order, time)
}

function orderAttack(agent, target, partialMatchId, partialMatchType, time){
    /// attack the target
    var order = new Order(ORDER_TYPE.ATTACK, target, partialMatchId, partialMatchType)
    CharacterBase.addOrder(agent, target, order, time)
}

function orderHeal(agent, target, partialMatchId, partialMatchType, time){
    /// heal the target
    var order = new Order(ORDER_TYPE.HEAL, target, partialMatchId, partialMatchType)
    CharacterBase.addOrder(agent, target, order, time)
}



module.exports = {
    intervene,
}