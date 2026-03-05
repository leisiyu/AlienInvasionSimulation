/**
 * Pair Correlation Function / Radial Distribution Function g(r).
 *
 * Uses alive agents' positions (ignores DIED) to estimate:
 *   g(r) = (observed pair density at distance r) / (expected pair density under CSR)
 *
 * In 2D with intensity λ = N / A, the expected number of neighbors
 * in a ring [r, r + dr] around a point is:
 *   2 * π * λ * r * dr
 * We estimate g(r) by:
 *   g(r_k) ≈ count_k / (N * 2 * π * λ * r_k * dr)
 * where count_k is the number of ordered pairs (i, j), i ≠ j,
 * whose distance falls into bin k.
 */

const CharactersData = require('../Character/CharactersData')
const Utils = require('../Utils')
const NND = require('./NearestNeighborDistance')

// Store per-beat PCF results (g and radii) for a single run
var aggregatedPCFResults = []
var aggregatedPCFRadii = null

/**
 * Compute Euclidean distance between two positions [x, y].
 * (Reuses the same metric as NND for consistency.)
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
 * Compute the pair correlation function g(r) for the current (or provided) agents.
 *
 * @param {Object} [options]
 * @param {Object[]} [options.agents] - Optional array of agents. If omitted, uses CharactersData.charactersArray.
 * @param {number} [options.binWidth=1] - Bin width dr for r.
 * @param {number} [options.maxRadius] - Max radius to consider. Defaults to min(mapWidth, mapHeight) / 2.
 * @returns {{
 *   radii: number[],        // bin centers r_k
 *   g: number[],            // g(r_k) values
 *   counts: number[],       // raw pair counts per bin
 *   binWidth: number,
 *   maxRadius: number,
 *   density: number,
 *   aliveCount: number,
 *   totalAgents: number,
 *   area: number
 * }}
 */
function aggregate(options) {
  options = options || {}
  const agents = options.agents

  const { agents: aliveAgents, positions } = NND.getAliveAgentsAndPositions(agents)
  const totalAgents = (agents != null ? agents : CharactersData.charactersArray).length
  const aliveCount = aliveAgents.length

  const area = Utils.MAP_SIZE[0] * Utils.MAP_SIZE[1]

  // Edge cases: not enough agents or invalid area
  if (aliveCount < 2 || area <= 0) {
    return {
      radii: [],
      g: [],
      counts: [],
      binWidth: options.binWidth || 1,
      maxRadius: 0,
      density: NaN,
      aliveCount,
      totalAgents,
      area,
    }
  }

  const density = aliveCount / area

  const binWidth = options.binWidth != null ? options.binWidth : 1
  const defaultMaxRadius = Math.min(Utils.MAP_SIZE[0], Utils.MAP_SIZE[1]) / 2
  const maxRadius = options.maxRadius != null ? options.maxRadius : defaultMaxRadius

  const numBins = Math.max(1, Math.floor(maxRadius / binWidth))
  const counts = new Array(numBins).fill(0)

  // Count ordered pairs (i, j), i != j
  for (let i = 0; i < aliveCount; i++) {
    const pi = positions[i]
    for (let j = 0; j < aliveCount; j++) {
      if (j === i) continue
      const d = distance(pi, positions[j])
      if (d >= maxRadius || d < 0) continue
      const bin = Math.floor(d / binWidth)
      if (bin >= 0 && bin < numBins) {
        counts[bin]++
      }
    }
  }

  const radii = []
  const g = []

  for (let k = 0; k < numBins; k++) {
    const rMid = (k + 0.5) * binWidth
    radii.push(rMid)

    const expectedPerPoint = 2 * Math.PI * density * rMid * binWidth
    const expectedTotal = aliveCount * expectedPerPoint

    const observed = counts[k]
    const gk = expectedTotal > 0 ? observed / expectedTotal : NaN
    g.push(gk)
  }

  const result = {
    radii,
    g,
    counts,
    binWidth,
    maxRadius,
    density,
    aliveCount,
    totalAgents,
    area,
  }

  return result
}

function recordAggregation(currentTime, options) {
  const result = aggregate(options)
  if (!aggregatedPCFRadii) {
    aggregatedPCFRadii = result.radii
  }
  aggregatedPCFResults.push({
    time: currentTime,
    g: result.g,
  })
  return result
}

function getAggregatedPCFResults() {
  return aggregatedPCFResults
}

function getAverageG() {
  if (aggregatedPCFResults.length === 0 || !aggregatedPCFRadii) {
    return { radii: [], g: [] }
  }

  const numBins = aggregatedPCFRadii.length
  const sums = new Array(numBins).fill(0)
  const counts = new Array(numBins).fill(0)

  for (let t = 0; t < aggregatedPCFResults.length; t++) {
    const gt = aggregatedPCFResults[t].g
    for (let k = 0; k < numBins; k++) {
      const val = gt[k]
      if (Number.isFinite(val)) {
        sums[k] += val
        counts[k] += 1
      }
    }
  }

  const avgG = []
  for (let k = 0; k < numBins; k++) {
    avgG.push(counts[k] > 0 ? sums[k] / counts[k] : NaN)
  }

  return { radii: aggregatedPCFRadii, g: avgG }
}

function resetAggregatedPCFResults() {
  aggregatedPCFResults = []
  aggregatedPCFRadii = null
}

module.exports = {
  aggregate,
  recordAggregation,
  getAggregatedPCFResults,
  getAverageG,
  resetAggregatedPCFResults,
}

