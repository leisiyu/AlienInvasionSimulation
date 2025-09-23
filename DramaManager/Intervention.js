/// How to intervene in the story
/// Different types of interventions
/// 

function intervene(event){
    var target = event[""]
    switch (event["tag"]){
        case "attacks":
        case "shoots":
            break;
        case "is chasing":
            break;
        case "is healing":
            break;
        case "kills":
            break;
    }
}


/// Move A to B
function orderMoveTo(agent, position){
    /// move the agent to the position ()
}

/// Attack target with critical hit
function criticalHit(agent, target){
    /// attack the target with critical hit
}

function orderAttack(agent, target){
    /// attack the target
}

/// Find an enemy nearby
function findEnemy(target){
    /// free states enemies nearby (check the map)
    /// if target is an alien, find solders and armed civilians
    /// if target is a human, find aliens
}

function findAlly(target){
    /// free states allies nearby (check the map)
    /// if target is an alien, find aliens
    /// if target is a human, find solders and armed civilians
}

function findMediKit(agent){
    /// medi kit nearby (check the map)
}

function orderHeal(agent, target){
    /// heal the target
}



module.exports = {

}