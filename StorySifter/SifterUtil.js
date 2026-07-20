
function checkCharacterType(characterName, characterType) {
        
    if (characterType == undefined || characterType == null) {return true}
    if (characterName === "" || characterName == undefined) {return true}
    var currentType = ""
    switch (characterName.charAt(0)){
        case "ns":
            currentType = "SOLDIER"
            break
        case "na":
            currentType = "ALIEN"
            break
        case "nt":
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