/**
 * Nearest-Neighbor Distance aggregation.
 * Uses every agent's position; died agents are ignored.
 */

const CharactersData = require('../Character/CharactersData')
const Utils = require('../Utils')

var aggregatedResults = []

/**
 * Euclidean distance between two positions [x, y].
 * @param {[number, number]} p1
 * @param {[number, number]} p2
 * @returns {number}
 */
function distance(p1, p2) {
	const dx = p1[0] - p2[0]
	const dy = p1[1] - p2[1]
	return Math.sqrt(dx * dx + dy * dy)
}

/**
 * For one agent, get the distance to its nearest neighbor among the rest of the positions.
 * @param {[number, number]} pos
 * @param {[number, number][]} otherPositions
 * @returns {number} nearest-neighbor distance (Infinity if no others)
 */
function nearestNeighborDistanceForPosition(pos, otherPositions) {
	if (otherPositions.length === 0) return Infinity
	let minDist = Infinity
	for (let i = 0; i < otherPositions.length; i++) {
		const d = distance(pos, otherPositions[i])
		if (d < minDist) minDist = d
	}
	return minDist
}

/**
 * Get alive agents only (ignore DIED).
 * @param {Object[]} [agents] - Optional array of agents. If omitted, uses CharactersData.charactersArray.
 * @returns {{ agents: Object[], positions: [number, number][] }}
 */
function getAliveAgentsAndPositions(agents) {
	const source = agents != null ? agents : CharactersData.charactersArray
	const agentsAlive = []
	const positions = []
	for (let i = 0; i < source.length; i++) {
		const agent = source[i]
		if (agent.state && agent.state.stateType !== Utils.CHARACTER_STATES.DIED) {
			agentsAlive.push(agent)
			positions.push(agent.position)
		}
	}
	return { agents: agentsAlive, positions }
}

/**
 * Compute nearest-neighbor distance for each alive agent and return aggregated results.
 * @param {Object[]} [agents] - Optional array of agents. If omitted, uses CharactersData.charactersArray.
 * @returns {{
 *   mean: number,
 *   min: number,
 *   max: number,
 *   values: number[],
 *   aliveCount: number,
 *   totalAgents: number
 * }}
 */
function aggregate(agents) {
	const { agents: aliveAgents, positions } = getAliveAgentsAndPositions(agents)
	const totalAgents = (agents != null ? agents : CharactersData.charactersArray).length
	const n = aliveAgents.length
	const values = []

	for (let i = 0; i < n; i++) {
		const pos = positions[i]
		const others = positions.slice(0, i).concat(positions.slice(i + 1))
		const nnd = nearestNeighborDistanceForPosition(pos, others)
		values.push(nnd)
	}

	let mean = 0
	let min = Infinity
	let max = -Infinity
	for (let i = 0; i < values.length; i++) {
		const v = values[i]
		mean += v
		if (v < min) min = v
		if (v > max) max = v
	}
	if (n > 0) mean /= n
	if (min === Infinity) min = NaN
	if (max === -Infinity) max = NaN

	return {
		mean,
		min,
		max,
		values,
		aliveCount: n,
		totalAgents,
	}
}

function recordAggregation(currentTime) {
	const result = aggregate()
	aggregatedResults.push({
		time: currentTime,
		mean: result.mean,
		min: result.min,
		max: result.max,
		aliveCount: result.aliveCount,
		totalAgents: result.totalAgents,
	})
	return result
}

function getAggregatedResults() {
	return aggregatedResults
}

function getAverageAggregation() {
	if (aggregatedResults.length === 0) return NaN
	let sum = 0
	let count = 0
	for (let i = 0; i < aggregatedResults.length; i++) {
		const v = aggregatedResults[i].mean
		if (Number.isFinite(v)) {
			sum += v
			count++
		}
	}
	return count > 0 ? sum / count : NaN
}

function resetAggregatedResults() {
	aggregatedResults = []
}

function areAgentsGathered() {
	const { mean, aliveCount } = aggregate()
	if (aliveCount <= 1) return false

	const area = Utils.MAP_SIZE[0] * Utils.MAP_SIZE[1]
	const typicalSpacing = Math.sqrt(area / aliveCount)

	const threshold = 0.5 * typicalSpacing

	return mean < threshold
}

module.exports = {
	aggregate,
	getAliveAgentsAndPositions,
	nearestNeighborDistanceForPosition,
	distance,
	areAgentsGathered,
	aggregatedResults,
	recordAggregation,
	getAggregatedResults,
	getAverageAggregation,
	resetAggregatedResults,
}
