/**
 * Clark–Evans Aggregation Index (R).
 * Uses alive agents' positions (ignores DIED) to compute:
 *   R = observed_mean_nn_distance / expected_mean_nn_distance_under_CSR
 * R < 1  -> aggregated (clustered)
 * R ~ 1  -> random (CSR)
 * R > 1  -> regular (over-dispersed)
 */
// R < 0.95 → clearly gathered
// 0.95 ≤ R ≤ 1.05 → about random
// R > 1.05 → clearly dispersed

const CharactersData = require('../Character/CharactersData')
const Utils = require('../Utils')
const NND = require('./NearestNeighborDistance')

// Store per-beat Clark–Evans results for a single run
var aggregatedRResults = []

/**
 * Compute Clark–Evans R for the current (or provided) agents.
 * @param {Object[]} [agents] - Optional array of agents. If omitted, uses CharactersData.charactersArray.
 * @returns {{
 *   R: number,
 *   observedMean: number,
 *   expectedMean: number,
 *   density: number,
 *   aliveCount: number,
 *   totalAgents: number,
 *   area: number
 * }}
 */
function aggregate(agents) {
  const { agents: aliveAgents } = NND.getAliveAgentsAndPositions(agents)
  const totalAgents = (agents != null ? agents : CharactersData.charactersArray).length
  const aliveCount = aliveAgents.length

  const area = Utils.MAP_SIZE[0] * Utils.MAP_SIZE[1]

  // Edge cases: not enough agents or invalid area
  if (aliveCount < 2 || area <= 0) {
    return {
      R: NaN,
      observedMean: NaN,
      expectedMean: NaN,
      density: NaN,
      aliveCount,
      totalAgents,
      area,
    }
  }

  // Observed mean nearest-neighbor distance (same as NND.aggregate().mean)
  const nndResult = NND.aggregate(agents)
  const observedMean = nndResult.mean

  // Density λ = N / A (use alive agents for the process of interest)
  const density = aliveCount / area

  // Expected mean nearest-neighbor distance under CSR in 2D:
  // E[r] = 1 / (2 * sqrt(λ))
  const expectedMean = 1 / (2 * Math.sqrt(density))

  const R = observedMean / expectedMean

  return {
    R,
    observedMean,
    expectedMean,
    density,
    aliveCount,
    totalAgents,
    area,
  }
}

function recordAggregation(currentTime, agents) {
  const result = aggregate(agents)
  aggregatedRResults.push({
    time: currentTime,
    R: result.R,
    observedMean: result.observedMean,
    expectedMean: result.expectedMean,
    density: result.density,
    aliveCount: result.aliveCount,
    totalAgents: result.totalAgents,
    area: result.area,
  })
  return result
}

function getAggregatedRResults() {
  return aggregatedRResults
}

function getAverageR() {
  if (aggregatedRResults.length === 0) return NaN
  let sum = 0
  let count = 0
  for (let i = 0; i < aggregatedRResults.length; i++) {
    const v = aggregatedRResults[i].R
    if (Number.isFinite(v)) {
      sum += v
      count++
    }
  }
  return count > 0 ? sum / count : NaN
}

function resetAggregatedRResults() {
  aggregatedRResults = []
}

module.exports = {
  aggregate,
  recordAggregation,
  getAggregatedRResults,
  getAverageR,
  resetAggregatedRResults,
}

