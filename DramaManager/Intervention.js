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
            // find target first
            if (target == null){
                target = findEnemy(agent)

                // console.log("attack/shoot: find a target ")
            }
            if (agent == null) {
                agent = findEnemy(target)
            }
            if (target == null || agent == null){
                //abandon it in this run
            } else {
                // console.log("target  " + target.charName + agent.charName)
                var distance = CharacterBase.calDistanceOfCharacters(agent, target)
                if (distance > agent.attackRange) {
                    orderMoveTo(agent, target)
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
function orderMoveTo(agent, target){
    /// move the agent to the position ()
    var order = new Order(ORDER_TYPE.MOVE, target)
    CharacterBase.addOrder(agent, order)
}

/// Attack target with critical hit
function criticalHit(agent, target){
    /// attack the target with critical hit
}

function orderAttack(agent, target){
    /// attack the target
    var order = new Order(ORDER_TYPE.ATTACK, target)
    CharacterBase.addOrder(agent, order)
}

/// Find an enemy nearby
function findEnemy(agent){
    /// enemies nearby (check the map)
    /// if target is an alien, find solders and armed civilians
    /// if target is a human, find aliens

    var range = 15
	var startX = agent.position[0] - range < 0 ? 0 : agent.position[0] - range
	var endX = agent.position[0] + range >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] - 1 : agent.position[0] + range
	var startY = agent.position[1] - range < 0 ? 0 : agent.position[1] - range
	var endY = agent.position[1] + range >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] - 1 : agent.position[1] + range

    var enemies = []
    for (let i = 0; i < CharactersData.charactersArray.length; i++) {
		var character = CharactersData.charactersArray[i]
		var characterPos = character.position
		if (character.state.stateType != Utils.CHARACTER_STATES.DIED 
			&& characterPos[0] >= startX && characterPos[0] <= endX 
			&& characterPos[1] >= startY && characterPos[1] <= endY
			&& character.charType != agent.charType){
			// && ((agent.charType == Utils.CHARACTER_TYPE.ALIEN && (character.charType == Utils.CHARACTER_TYPE.TOWNSFOLK || character.charType == Utils.CHARACTER_TYPE.SOLDIER))
                // || ((agent.charType == Utils.CHARACTER_TYPE.TOWNSFOLK || agent.charType == Utils.CHARACTER_TYPE.SOLDIER) && character.charType == Utils.CHARACTER_TYPE.ALIEN))){
                if ((agent.charType == Utils.CHARACTER_TYPE.SOLDIER || agent.charType == Utils.CHARACTER_TYPE.TOWNSFOLK) 
                    && character.charType == Utils.CHARACTER_TYPE.ALIEN) {
                        enemies.push(character)
                }
                if (agent.charType == Utils.CHARACTER_TYPE.ALIEN) {
                    enemies.push(character)
                }
                
                
            }
	}
    return enemies[Math.floor(Math.random() * enemies.length)]
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