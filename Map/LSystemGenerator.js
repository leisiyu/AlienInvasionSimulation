const Rule = require("./Rule").Rule
class LSystemGenerator{

    constructor(rule, axiom, iterationLimit){
        this.rule = new Rule('F', rule)
        this.axiom = axiom
        this.iterationLimit = iterationLimit
        this.iterationIdx = 0
    }
    
    generateSentence(word){
        if (word == null) {
            word = this.axiom
        }
        return this.growRecursive(word)
    }

    growRecursive(word){
        if (this.iterationIdx >= this.iterationLimit){
            return word
        }

        var newWord = ""
        for(let i = 0; i < word.length; i++){
            var character = word.charAt(i)
            newWord = newWord + character
            if (this.rule.checkLetter(character)){
                newWord = newWord + this.rule.getRandomResult()
            }
        }
        this.iterationIdx++

        return this.growRecursive(newWord)
    }

}

module.exports = {
    LSystemGenerator,
}