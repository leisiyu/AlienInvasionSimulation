function generateMapSize(){
    var sizes = [
        [50, 50],
        [100, 100],
        [150, 150],
        [200, 200],
        [500, 500]
    ]

    return sizes[Math.floor(Math.random() * sizes.length)]
}

function generateCharacterNum(){
    var nums = [
        5,
        10,
        20,
        30,
        50
    ]

    return nums[Math.floor(Math.random() * nums.length)]
}
const MAP_SIZE = generateMapSize()

const ALIENS_NUM = generateCharacterNum()

const TOWNFOLKS_NUM = generateCharacterNum()

const SOLIDERS_NUM = generateCharacterNum()

module.exports = {
    MAP_SIZE,
    ALIENS_NUM,
    TOWNFOLKS_NUM,
    SOLIDERS_NUM
}