
class Rule{
    constructor(letter, rules){
        this.letter = letter
        this.rules = rules
    }

    checkLetter(letter){
        return this.letter == letter
    }

    getRandomResult(){
        var randomIdx = Math.floor(Math.random() * this.rules.length)
        return this.rules[randomIdx]
    }
}

module.exports = {
    Rule,
}