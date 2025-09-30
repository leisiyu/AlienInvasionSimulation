/// How to intervene in the story
/// Different types of interventions
/// 
const CharacterBase = require("../Character/CharacterBase.js")
const { Order } = require("./Order.js").Order
const ORDER_TYPE = require("./Order.js").ORDER_TYPE
const CharactersData = require("../Character/CharactersData.js")

function intervene(event){
    var agent = CharactersData.getCharacterByName(event["N1"])
    var target = null
    if (event["N2"] != undefined) {
        target = CharactersData.getCharacterByName(event["N2"])
    }
    switch (event["L"]){
        case "attacks":
        case "shoots":
            console.log("intervening: attack/shoot ")
            // find target first
            if (target == null){
                console.log("attack/shoot: find a target")
                target = findEnemy(agent)
            }
            if (target == null){
                //abandon it in this run
            } else {
                var distance = CharacterBase.calDistanceOfCharacters(agent, target)
                if (distance > agent.attackRange) {
                    orderMoveTo(agent, target.position)
                } else {
                    orderAttack(agent, target)
                }
            }

            break;
        case "is chasing":
            break;
        case "is healing":
            break;
        case "kills":
            criticalHit(agent, target)
            break;
    }
}


/// Move A to B
function orderMoveTo(agent, position){
    /// move the agent to the position ()
    var order = new Order(ORDER_TYPE.MOVE, null, position)
    CharacterBase.addOrder(agent, order)
}

/// Attack target with critical hit
function criticalHit(agent, target){
    /// attack the target with critical hit
}

function orderAttack(agent, target){
    /// attack the target
}

/// Find an enemy nearby
function findEnemy(agent){
    /// enemies nearby (check the map)
    /// if target is an alien, find solders and armed civilians
    /// if target is a human, find aliens

    return target
}

function findAlly(target){
    /// free states allies nearby (check the map)
    /// if target is an alien, find aliens
    /// if target is a human, find solders and armed civilians

    return ally
}

function findMediKit(agent){
    /// medi kit nearby (check the map)
}

function orderHeal(agent, target){
    /// heal the target
}


module.exports = {
    intervene,
}