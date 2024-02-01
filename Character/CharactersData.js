
const charactersArray = []

function getCharacterByName(name){
    for (let i = 0; i < charactersArray.length; i++) {
        if (name == charactersArray[i].charName) {
            return charactersArray[i]
        }
    }
    console.info("There is not a character named: " + name)
    return null
}

module.exports = {
    charactersArray,
    getCharacterByName,
}