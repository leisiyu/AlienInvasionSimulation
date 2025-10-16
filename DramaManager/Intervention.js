/// How to intervene in the story
/// Different types of interventions
/// 
const CharacterBase = require("../Character/CharacterBase.js")
const Order = require("./Order.js").Order
const ORDER_TYPE = require("./Order.js").ORDER_TYPE
const CharactersData = require("../Character/CharactersData.js")
const Utils = require('../Utils.js') 

function intervene(event){
    console.log("event log: " + event["L"] + event["N1"] + event["N2"])
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
            // console.log("intervening: attack/shoot ")
            if (agent == null) {
                agent = CharacterBase.findEnemy(target)
            }
            if (agent != null){
                orderAttack(agent, target)
            }
            // if agent is null, abandon this order 
            break;
        case "is chasing":

            if (agent == null) {
                agent = findEnemy(target)
            }
            if (agent != null){
                orderChase(agent, target)
            }
            break;
        case "is healing":
            break;
        case "kills":

            if (agent == null) {
                agent = findEnemy(target)
            }
            if (agent != null){
                orderCriticalHit(agent, target)
            }
            
            break;
    }
}


/// Move A to B
function orderChase(agent, target){
    /// move the agent to the position ()
    var order = new Order(ORDER_TYPE.MOVE, target)
    CharacterBase.addOrder(agent, target, order)
}

/// Attack target with critical hit
function orderCriticalHit(agent, target){
    /// attack the target with critical hit
    var order = new Order(ORDER_TYPE.KILL, target)
    CharacterBase.addOrder(agent, target, order)
}

function orderAttack(agent, target){
    /// attack the target
    var order = new Order(ORDER_TYPE.ATTACK, target)
    CharacterBase.addOrder(agent, target, order)
}

function orderHeal(agent, target){
    /// heal the target
    var order = new Order(ORDER_TYPE.HEAL, target)
    CharacterBase.addOrder(agent, target, order)
}



module.exports = {
    intervene,
}