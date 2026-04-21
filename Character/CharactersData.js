const Utils = require("../Utils.js")

const charactersArray = []
const newAddedCharacters = []

function getCharacterByName(name){
    for (let i = 0; i < charactersArray.length; i++) {
        if (name == charactersArray[i].charName) {
            return charactersArray[i]
        }
    }
    // console.info("There is not a character named: " + name)
    return null
}

function getPopulationByType(type){
    var population = 0
    for (let i = 0; i < charactersArray.length; i++) {
        if (charactersArray[i].objType == type
            && charactersArray[i].state.stateType != Utils.CHARACTER_STATES.DIED
        ) {
            population = population + 1
        }
    }
    return population
}

function addNewCharacter(character){
    charactersArray.push(character)
    newAddedCharacters.push(character)
}

function getNewAddedCharacters(){
    return newAddedCharacters
}

module.exports = {
    charactersArray,
    getCharacterByName,
    getPopulationByType,
    addNewCharacter,
    getNewAddedCharacters,
}