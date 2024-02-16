
class Probability {

    properties = []
    weights = []
    constructor(propertiesArray, propertiesWeight){
        this.properties = propertiesArray
        this.weights = propertiesWeight
    }

    updateWeights(newWeights){
        this.weights = newWeights
    }

    updateWeightsByIdx(idx, weight){
        this.weights[idx] = weight
    }
    
    randomlyPick(){
        var weightedArray = []
        for (let i = 0; i < this.properties.length; i++){
            for (let j = 0; j < this.weights[i]; j++){
                weightedArray.push(this.properties[i])
            }
        }

        return weightedArray[Math.floor(Math.random() * weightedArray.length)]
    }
}

module.exports = {
    Probability,
}