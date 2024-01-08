const LSystemGenerator = require('./LSystemGenerator').LSystemGenerator
const MapUtil = require('./MapUtil')
const Utils = require('../Utils')
const Road = require('./Road').Road

var EncodingLetters = {
    unknown:'1',
    save: '[',
    load:']',
    draw: 'F',
    turnRight: '+',
    turnLeft: '-',
}

var allRoads = []
var junctions = []
var drawIdx = 0

function generateRoads(startPos){
    var LSystem = new LSystemGenerator(['[+F][-F]', '[+F]F[-F]', '[-F]F[+F]'], '[F]--F', 2, 0.35)
	var sentence = LSystem.generateSentence()
    console.log(sentence)
    var roadLength = MapUtil.MAIN_ROAD_LENGTH
    var roadWidth = MapUtil.MAIN_ROAD_WIDTH
    var savePoints = []
    var currentPosition = JSON.stringify(startPos)
    var direction = Utils.DIRECTION[Math.floor(Math.random() * 4)]

    for(let i = 0; i < sentence.length; i++){
        var letter = sentence.charAt(i)

        switch(letter){
            case EncodingLetters.save:
                savePoints.push({
                    position: JSON.parse(currentPosition),
                    direction: direction,
                    length: roadLength,
                })
                break
            case EncodingLetters.load:
                if (savePoints.length > 0) {
                    var tempParameter = savePoints.pop()
                    currentPosition = JSON.stringify(tempParameter.position)
                    direction = tempParameter.direction
                    roadLength = tempParameter.length
                } else {
                    console.log("error: nothing in savePoints")
                }
                break
            case EncodingLetters.draw:
                drawRoad(currentPosition, direction, roadLength)
                currentPosition = JSON.stringify(calculateNewPosition(currentPosition, direction, roadLength))
                if (drawIdx % 3 == 0){
                    roadLength = roadLength - 2 > 0 ? roadLength - 2 : 1
                }
                junctions.push(currentPosition)
                break
            case EncodingLetters.turnLeft:
                direction = changeDirection(direction, false)
                break
            case EncodingLetters.turnRight:
                direction = changeDirection(direction, true)
                break
        }
    }
    return allRoads
}

function changeDirection(originalDirection, isTurnRight){
    var newDirection = Utils.DIRECTION[0]
    switch(originalDirection){
        case Utils.DIRECTION[0]:
            newDirection = isTurnRight ? Utils.DIRECTION[3] : Utils.DIRECTION[2]
            break
        case Utils.DIRECTION[1]:
            newDirection = isTurnRight ? Utils.DIRECTION[2] : Utils.DIRECTION[3]
            break
        case Utils.DIRECTION[2]:
            newDirection = isTurnRight ? Utils.DIRECTION[0] : Utils.DIRECTION[1]
            break
        case Utils.DIRECTION[3]:
            newDirection = isTurnRight ? Utils.DIRECTION[1] : Utils.DIRECTION[0]
            break
    }

    return newDirection
}

function calculateNewPosition(startPos, direction, roadLength){
    var newPosition = JSON.parse(startPos)
    switch(direction){
        case Utils.DIRECTION[0]:
            newPosition[1] = newPosition[1] - roadLength < 0 ? 0 : newPosition[1] - roadLength
            break
        case Utils.DIRECTION[1]:
            newPosition[1] = newPosition[1] + roadLength >= Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] : newPosition[1] + roadLength
            break
        case Utils.DIRECTION[2]:
            newPosition[0] = newPosition[0] - roadLength < 0 ? 0 : newPosition[0] - roadLength
            break
        case Utils.DIRECTION[3]:
            newPosition[0] = newPosition[0] + roadLength >= Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] : newPosition[0] + roadLength
            break
    }   
    return newPosition
}

function drawRoad(startPos, direction, roadLength){
    var startPosition = JSON.parse(startPos)
    var endPosition = calculateNewPosition(startPos, direction, roadLength)
    var roadPosition = startPosition
    var roadSize = [0,0]

    if (startPosition[0] < 0 || startPosition[0] >= Utils.MAP_SIZE[0] 
        || startPosition[1] < 0 || startPosition[1] >= Utils.MAP_SIZE[1]){
            return
    }

    endPosition[0] = endPosition[0] < 0 ? 0 : endPosition[0]
    endPosition[0] = endPosition[0] > Utils.MAP_SIZE[0] ? Utils.MAP_SIZE[0] : endPosition[0]
    endPosition[1] = endPosition[1] < 0 ? 0 : endPosition[1]
    endPosition[1] = endPosition[1] > Utils.MAP_SIZE[1] ? Utils.MAP_SIZE[1] : endPosition[1]

    if (startPosition[0] == endPosition[0] && startPosition[1] == endPosition[1]){
        return
    }
    drawIdx++

    switch(direction){
        case Utils.DIRECTION[0]:
            roadPosition = endPosition
            roadSize = [1, startPosition[1] - endPosition[1]]
            break
        case Utils.DIRECTION[1]:
            roadPosition = startPosition
            roadSize = [1, endPosition[1] - startPosition[1]]
            break
        case Utils.DIRECTION[2]:
            roadPosition = endPosition
            roadSize = [startPosition[0] - endPosition[0], 1]
            break
        case Utils.DIRECTION[3]:
            roadPosition = startPosition
            roadSize = [endPosition[0] - startPosition[0], 1]
            break
    }
    var road = new Road(roadPosition, roadSize)
    allRoads.push(road)
}

function checkRoadAvailable(position, size){
    if (size[0] == 0 || size[1] == 0) {
        return false
    }
    return true
}

function clearData(){
    allRoads = []
    junctions = []
    drawIdx = 0
}

module.exports = {
    generateRoads,
    allRoads,
    junctions,
    clearData,
}