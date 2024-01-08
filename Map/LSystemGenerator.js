const Rule = require("./Rule").Rule
class LSystemGenerator{

    constructor(rule, axiom, iterationLimit, ignoreRulePossiblity){
        this.rule = new Rule('F', rule)
        this.axiom = axiom
        this.iterationLimit = iterationLimit
        this.iterationIdx = 0
        this.ignoreRulePossiblity = ignoreRulePossiblity
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
            if (Math.random() > this.ignoreRulePossiblity) {
                if (this.rule.checkLetter(character)){
                    newWord = newWord + this.rule.getRandomResult()
                }
            }
        }
        this.iterationIdx++

        return this.growRecursive(newWord)
    }

}

module.exports = {
    LSystemGenerator,
}