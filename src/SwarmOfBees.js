"use strict;"

const Bee = require('./Bee')
const SwarmChallenge = require('./SwarmChallenge')
const {
  prefilledVector,
  cloneVector
} = require(`./libs/vectorUtils`)
// const {computePositionError} = require('./libs/mathUtils')

const DEFAULT_VECTOR_PREFILL_VALUE = 0.0
const DEFAULT_MAX_ERROR_VALUE = Number.MAX_VALUE

class SwarmOfBees {
  // assumes it's passed a SwarmChallenge object
  constructor (
    {
      dimensionCount,
      swarmSize,
      computeErrorFn,
      minX,
      maxX,
      maxEpochs,
      exitError
    }
  ){
    this.dimensionCount = dimensionCount
    this.swarmSize = swarmSize
    this.computeErrorFn = computeErrorFn
    this.maxEpochs = maxEpochs
    this.exitError = exitError
    this.minX = minX
    this.maxX = maxX

    this.bestPosition = []
    this.bestError = Number.MAX_VALUE
  }

  attack() {
    const solution = SwarmOfBees.solve(
      this.dimensionCount,
      this.swarmSize,
      this.computeErrorFn,
      this.minX,
      this.maxX,
      this.maxEpochs,
      this.exitError
    )

    this.bestError = this.computeErrorFn(solution.finalPosition);

    return solution
  }

  static solve(
    dimensionCount,
    swarmSize,
    computePositionError,
    minX,
    maxX,
    maxEpochs,
    exitError
  ) {
    let bestGlobalPosition = prefilledVector(swarmSize, DEFAULT_VECTOR_PREFILL_VALUE)
    let bestGlobalError = DEFAULT_MAX_ERROR_VALUE
    let beeDeaths = 0

    // collect a swarm
    const swarm = prefilledVector(swarmSize, DEFAULT_VECTOR_PREFILL_VALUE)
    for (var i = 0; i < swarm.length; ++i) {
      const randomPosition = prefilledVector(dimensionCount, DEFAULT_VECTOR_PREFILL_VALUE)
      for (var j = 0; j < randomPosition.length; ++j)
        randomPosition[j] = (maxX - minX) * Math.random() + minX

      let error = computePositionError(randomPosition)
      let randomVelocity = prefilledVector(dimensionCount, DEFAULT_VECTOR_PREFILL_VALUE)

      for (var j = 0; j < randomVelocity.length; ++j) {
        let lo = minX * 0.1
        let hi = maxX * 0.1
        randomVelocity[j] = (hi - lo) * Math.random() + lo
      }
      swarm[i] = new Bee( randomPosition, error, randomVelocity, randomPosition, error )

      // does current Particle have global best position/solution?
      if (swarm[i].error < bestGlobalError) {
        bestGlobalError = swarm[i].error
        bestGlobalPosition = cloneVector( swarm[i].position )
      }
    }

    // prepare the swarm
    const w = 0.729 // inertia weight. see http://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=00870279
    const c1 = 1.49445 // cognitive/local weight
    const c2 = 1.49445 // social/global weight
    const probDeath = 0.01

    let r1
    let r2 // cognitive and social randomizations
    
    let epoch = 0

    let newVelocity = prefilledVector(dimensionCount, DEFAULT_VECTOR_PREFILL_VALUE)
    let newPosition = prefilledVector(dimensionCount, DEFAULT_VECTOR_PREFILL_VALUE)
    let newError = DEFAULT_MAX_ERROR_VALUE

    // release the swarm
    while (epoch < maxEpochs) {
      for (var i = 0; i < swarm.length; ++i) { // each Bee
        let currentBee = swarm[i]

        // new velocity
        for (var j = 0; j < currentBee.velocity.length; ++j) // each component of the velocity
        {
          r1 = Math.random()
          r2 = Math.random()

          newVelocity[j] = (w * currentBee.velocity[j]) +
            (c1 * r1 * (currentBee.bestPosition[j] - currentBee.position[j])) +
            (c2 * r2 * (bestGlobalPosition[j] - currentBee.position[j]))
        }
        currentBee.velocity = cloneVector(newVelocity)

        // new position
        for (var j = 0; j < currentBee.position.length; ++j)
        {
          newPosition[j] = currentBee.position[j] + newVelocity[j];
          if (newPosition[j] < minX) {
            newPosition[j] = minX
          } else {
            if (newPosition[j] > maxX)
              newPosition[j] = maxX
          }
        }
        currentBee.position = cloneVector(newPosition)

        newError = computePositionError(newPosition);
        currentBee.error = newError;

        if (newError < currentBee.bestError)
        {
          currentBee.bestPosition = cloneVector(newPosition)
          currentBee.bestError = newError;
        }

        if (newError < bestGlobalError)
        {
          bestGlobalPosition = cloneVector(newPosition)
          bestGlobalError = newError;
        }

        // random Bee death?
        const timeToDie = Math.random()
        if (timeToDie < probDeath)
        {
          beeDeaths ++
          // new position, leave velocity, update error
          for (var j = 0; j < currentBee.position.length; ++j)
            currentBee.position[j] = (maxX - minX) * Math.random() + minX;

          currentBee.error = computePositionError(currentBee.position)
          currentBee.bestPosition = cloneVector(currentBee.position)
          currentBee.bestError = currentBee.error;

          if (currentBee.error < bestGlobalError) // global best by chance?
          {
            bestGlobalError = currentBee.error;
            bestGlobalPosition = cloneVector(currentBee.position)
          }
        }
      }

      ++epoch
    }

    const result = {
      finalPosition: cloneVector(bestGlobalPosition),
      swarm,
      initialSwarmSize: swarmSize * dimensionCount,
      beeDeaths,
      epochCount: epoch

    }
    return result
  }

}

module.exports = SwarmOfBees