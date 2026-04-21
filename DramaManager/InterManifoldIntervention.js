const MapManager = require("../Map/MapManager.js")
const Utils = require("../Utils.js")
const CharactersData = require("../Character/CharactersData.js")
const CharacterBase = require("../Character/CharacterBase.js")
const Soldier = require("../Character/Soldier.js").Soldier
const Alien = require("../Character/Alien.js").Alien
const Townfolk = require("../Character/Townfolk.js").Townfolk

const InterventionNumEachBeat = 3
const newObjects = []
var newObjectIdx = 1


// objectType: agent or gear
// objectSubType: agent type or gear type
function SingleObject(objectType, objectSubType, objectName, targetPosition, time){
    this.objectType = objectType
    this.objectSubType = objectSubType
    this.objectName = objectName
    this.targetPosition = targetPosition
    this.position = [0,0]
    this.time = time
}

function intervene(event, partialMatchId, partialMatchType, time){
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
        case "is chasing":
            agent = character1
            target = character2
            if (agent == null && target != null) {
                agent = CharacterBase.findEnemy(target)
            } else if (agent != null && target == null){
               target = CharacterBase.findEnemy(agent)
            }

            if (agent != null && target == null){
                var newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                switch (agent.objType){
                    case Utils.CHARACTER_TYPE.ALIEN:
                        newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                }

                generateNewAgentInfo(newAgentType, agent.position, time)
            } else if (agent == null && target != null){
                var newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                switch (target.objType){
                    case Utils.CHARACTER_TYPE.ALIEN:
                        newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                }
                generateNewAgentInfo(newAgentType, target.position, time)
            }
            break;  
            

        case "is healing":
            agent = character1
            target = character2
            if (agent == null && target != null) {
                agent = CharacterBase.findAlly(target)
            } else if (agent != null && target == null){
                target = CharacterBase.findAlly(agent)
            }

            // aliens don't heal
            if (agent != null && target == null){
                var newAgentType = Utils.CHARACTER_TYPE.SOLDIER

                generateNewAgentInfo(newAgentType, agent.position, time)
            } else if (agent == null && target != null){
                var newAgentType = Utils.CHARACTER_TYPE.SOLDIER

                generateNewAgentInfo(newAgentType, target.position, time)
            } else if (agent != null && target != null){
                if (CharacterBase.hasMediKit(agent.inventory)[0]){
                    // generateNewMedikitInfo(agent.position, time)
                }
            }
            break;

        case "is killed by":
            agent = character2
            target = character1
            if (target == null && agent != null) {
                target = CharacterBase.findEnemy(agent, null, null, false)
            } else if (agent == null && target != null) {
                agent = CharacterBase.findEnemy(target, null, null, false)
            }

            if (agent != null && target == null){
                var newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                switch (agent.objType){
                    case Utils.CHARACTER_TYPE.ALIEN:
                        newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                }

                generateNewAgentInfo(newAgentType, agent.position, time)
            } else if (agent == null && target != null){
                var newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                switch (target.objType){
                    case Utils.CHARACTER_TYPE.ALIEN:
                        newAgentType = Utils.CHARACTER_TYPE.SOLDIER
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        newAgentType = Utils.CHARACTER_TYPE.ALIEN
                        break;
                }
                generateNewAgentInfo(newAgentType, target.position, time)
            }
            
            break;
    }

}


function generateNewAgentInfo(agentType, position, time){
    var agentName = "n"
    // var agentPosition = [0,0]
    switch (agentType){
        case Utils.CHARACTER_TYPE.SOLDIER:
            agentName = agentName + "s" + newObjectIdx
            // agentPosition = MapManager.getTheNearestBuildingPos(position)
            break;
        case Utils.CHARACTER_TYPE.ALIEN:
            agentName = agentName + "a" + newObjectIdx
            // agentPosition = MapManager.getTheNearestPosOnEdge(position)
            break;
        case Utils.CHARACTER_TYPE.TOWNSFOLK:
            agentName = agentName + "t" + newObjectIdx
            // agentPosition = MapManager.getTheNearestBuildingPos(position)
            break;
    }
    newObjectIdx = newObjectIdx + 1
    var newAgent = new SingleObject(Utils.OBJECT_TYPE.AGENT, agentType, agentName, position, time)
    newAgent.position = getObjectPosition(newAgent)
    newObjects.push(newAgent)
}

function getObjectPosition(object){
    var objectPosition = [0, 0]
    switch (object.objectType){
        case Utils.OBJECT_TYPE.AGENT:
            objectPosition = MapManager.getTheNearestPosOnEdge(object.targetPosition)
            break
        case Utils.OBJECT_TYPE.GEAR:
            objectPosition = MapManager.getTheNearestInsideBuildingPos(object.targetPosition)
            break
    }
    return objectPosition
}

function generateNewMedikitInfo(position, time){
    var keys = Object.keys(Utils.HEALS)
    var medikitSubType = keys[Math.floor(keys.length * Math.random())]
    var medikitName = "n" + medikitSubType + newObjectIdx
    
    var newMedikit = new SingleObject(Utils.OBJECT_TYPE.GEAR, medikitSubType, medikitName, position, time)
    newMedikit.position = getObjectPosition(newMedikit)

    newObjects.push(newMedikit)
    newObjectIdx = newObjectIdx + 1
}


function medikitRankFirst(a, b) {
    var rank = function (o) {
        if (o.objectType === Utils.OBJECT_TYPE.GEAR) {
            return 0
        }
        if (o.objectType === Utils.OBJECT_TYPE.AGENT) {
            return 1
        }
        return 2
    }
    return rank(a) - rank(b)
}

function calDistance(object) {
    return Math.abs(object.position[0] - object.targetPosition[0]) + Math.abs(object.position[1] - object.targetPosition[1])
}

function nearestAgentRankFirst(a, b) {
    var da = calDistance(a)
    var db = calDistance(b)
    
    return da - db
    
}

// Pending objects closest to any living agent are added first (see nearestAgentRankFirst)
function addObjectOnMap(){
    if (newObjects.length == 0) {
        return
    }
    newObjects.sort(nearestAgentRankFirst)

    const Scheduler = require("../Scheduler.js")

    var index = 0
    while (index < InterventionNumEachBeat) {
        var object = newObjects.shift()
        if (object == null) {
            break
        }

        // console.log("object: " + object.objectType + " " + object.objectSubType + " " + object.objectName)
        if (object.objectType === Utils.OBJECT_TYPE.AGENT){
            // check population first, avoid too many agents on the map
            var agentPopulation = 0
            var maxPopulationRatio = 1
            switch (object.objectSubType){
                case Utils.CHARACTER_TYPE.SOLDIER:
                    agentPopulation = Utils.SOLIDERS_NUM * maxPopulationRatio
                    break
                case Utils.CHARACTER_TYPE.ALIEN:
                    agentPopulation = Utils.ALIENS_NUM *  maxPopulationRatio
                    break
                case Utils.CHARACTER_TYPE.TOWNSFOLK:
                    agentPopulation = Utils.TOWNFOLKS_NUM * maxPopulationRatio
                    break
            }
            if (CharactersData.getPopulationByType(object.objectSubType) <= agentPopulation){
                var agent = null
                switch (object.objectSubType){
                    case Utils.CHARACTER_TYPE.SOLDIER:
                        var agent = new Soldier(object.objectName, object.position)
                        break
                    case Utils.CHARACTER_TYPE.ALIEN:
                        var agent = new Alien(object.objectName, object.position)
                        break
                    case Utils.CHARACTER_TYPE.TOWNSFOLK:
                        var agent = new Townfolk(object.objectName, object.position)
                        break
                }
                if (agent != null){
                    CharactersData.addNewCharacter(agent)
                    Scheduler.scheduler.scheduleRepeatingIn(agent.simEvent, 1)
                    index = index + 1
                }
                
            } else {
                continue
            }
           
        } else if (object.objectType === Utils.OBJECT_TYPE.GEAR){
            MapManager.addGearObjectOnMap(object)
            index = index + 1
        }
    }
}
module.exports = {
    intervene,
    addObjectOnMap,
}
