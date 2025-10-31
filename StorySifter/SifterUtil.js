
function checkCharacterType(characterName, characterType) {
        
    if (characterType == undefined) {return true}
    if (characterName === "") {return true}
    var currentType = ""
    switch (characterName.charAt(0)){
        case "s":
            currentType = "SOLDIER"
            break
        case "a":
            currentType = "ALIEN"
            break
        case "t":
            currentType = "TOWNSFOLK"
            break
        case "M":
            currentType = "MEDIKIT"
            break
        case "R":
            currentType = "WEAPON"
            break
        case "G":
            currentType = "WEAPON"
            break
    }

    return currentType === characterType
}

const ROLL_BACK_TYPE = {
    ROLL_BACK: 0,
    DELETE: 1,
    NONE: 2
}

module.exports = {
    checkCharacterType,
    ROLL_BACK_TYPE
}