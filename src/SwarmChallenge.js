"use strict;"


class SwarmChallenge {
  constructor (
    dimensionCount,
    swarmSize,
    computeErrorFn,
    minX = -10.0,
    maxX = 10.0,
    maxEpochs = 1000,
    exitError = 0.0
  ) {
    this.dimensionCount = dimensionCount
    this.swarmSize = swarmSize
    this.computeErrorFn = computeErrorFn
    this.maxEpochs = maxEpochs
    this.exitError = exitError
    this.minX = minX
    this.maxX = maxX
  }
}

module.exports = SwarmChallenge;