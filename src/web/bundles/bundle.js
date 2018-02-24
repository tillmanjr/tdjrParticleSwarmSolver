(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict;"

const {
  cloneVector 
} = require('./libs/vectorUtils')

class Bee {
  constructor (
    position,
    error,
    velocity,
    bestPosition,
    bestError
  ) {
    this.position  = cloneVector(position)
    this.error = error
    this.velocity = cloneVector(velocity)
    this.bestPosition = cloneVector(bestPosition)
    this.bestError = bestError
  }
  
}

module.exports = Bee;
},{"./libs/vectorUtils":6}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{"./Bee":1,"./SwarmChallenge":2,"./libs/vectorUtils":6}],4:[function(require,module,exports){
"use strict;"

const NEW_LINE_CHAR = '\n'


function formatVector (
  vectorArray,
  fixedDecimals,
  valuesPerLine,
  appendBlankLine
) {
  let result = '';
  
  for (var i = 0; i < vectorArray.length; ++i) {
    if (i > 0 && i % valuesPerLine == 0) // max of 12 values per row 
      result += NEW_LINE_CHAR
  
    const val = vectorArray[i]
    if (val >= 0.0) result += (' ');

    result += `${val.toFixed(fixedDecimals)} `
  }

  if (appendBlankLine)  result += NEW_LINE_CHAR

  return result
}

module.exports = {
  formatVector
}
},{}],5:[function(require,module,exports){

const {solveDoubleDip} = require('./tests/swarm-test')

//test()

function getTestData() {return solveDoubleDip() }

if (!window['Swarming']) {
  window['Swarming'] = {
    getTestData
  }
}

module.exports = {getTestData}
},{"./tests/swarm-test":7}],6:[function(require,module,exports){
"use strict;"

const prefilledVector = (len, prefillValue) => {
  const result = []
  for (let i = 0; i < len; i++) {
    result[i] = prefillValue
  }
  return result;
}

const cloneVector = (vector) => vector.map( (x) => x)

const normalizeVectorRotateBy = (vectorLen, rotateBy) => {
  if (vectorLen == rotateBy) return 0
  if (rotateBy == 0) return 0

  if (rotateBy > 0) {
    return rotateBy < vectorLen ? rotateBy : vectorLen % rotateBy
  }

  return vectorLen + rotateBy
}

const rotateVector = (vector, rotateBy) => {
  const vectorLen = vector.length
  const _rotateBy =  normalizeVectorRotateBy(vectorLen, rotateBy);

  if (_rotateBy == 0) return vector

  const result = []
  for (let x = 0; x < vectorLen - _rotateBy; x++){
    result.push( vector[x + _rotateBy])
  }

  for (let y = 0; y < _rotateBy; y++) {
   result.push(vector[y])
  }

  return result
}

const exportUtils = {
  rotateVector,
  cloneVector,
  prefilledVector
}

module.exports = exportUtils
},{}],7:[function(require,module,exports){
"use strict;"

const SwarmChallenge = require('../SwarmChallenge')
const SwarmOfBees = require('../SwarmOfBees')
const {
  formatVector
 } = require('../formatters/textFormatters')

const doubleDip = (function (collectDataPointsFn) {
  _collectData = collectDataPointsFn

  // calulates f(x, y) = x * e^(-(x^2 + y^2) )
  _computeDoubleDip = (x, y) => x * Math.exp(-(x*x + y*y))

  // computes the error f(x, y) = x * e^(-(x^2 + y^2) )
  _computeDoubleDipErrorFn = (x, y) => {
    // minimum is 0.42888194248035300000 at x = -sqrt(2), y = 0
    const trueMin = -0.4288819424803530
    const z = _computeDoubleDip(x, y)
    const result = (z - trueMin) * (z - trueMin); // squared diff

    if (_collectData) _collectData(x, y, z, result)

    return result 
  }

  // helper to allow passing an array where x = x[0] and y = x[1] instead of discete x, y
  _computeDoubleDipErrorArrayFn = (x) => _computeDoubleDipErrorFn(x[0], x[1])

  // helper to allow passing an array where x = x[0] and y = x[1] instead of discete x, y
  _computeArrayResult = (x) => _computeDoubleDip(x[0], x[1])

  return {
    computeResult: _computeDoubleDip,
    computeArrayResult: _computeArrayResult,
    computeError: _computeDoubleDipErrorFn,
    computeArrayError: _computeDoubleDipErrorArrayFn
  }

})

const _SolveDoubleDip = (collectErrorData) => {
  const data = []
  
  const collectXYZErrorFn = (x, y, z, err) => data.push({x, y, z, error: err});
  const collectXYZFn = (x, y, z, err) => data.push({x, y, z});
  const collectDataFn = collectErrorData ? collectXYZErrorFn : collectXYZFn
  
  const dblDip = doubleDip(collectDataFn)

  const challenge = new SwarmChallenge(
    2,
    5,
    dblDip.computeArrayError,
    -10.0,
    10.0,
    1000,
    0.000000000000
  )

  const swarmOfBees = new SwarmOfBees(challenge)
  const solution = swarmOfBees.attack()

  const finalX = solution.finalPosition[0]
  const finalY = solution.finalPosition[1]
  const finalXY = solution.finalPosition

  const finalZ = dblDip.computeResult(finalX, finalY)
  const finalError = dblDip.computeError(finalX, finalY)
  const beeDeaths = solution.beeDeaths
  const epochCount = solution.epochCount

  const result = [finalX, finalY, finalZ]

  return {
    data,
    beeDeaths,
    epochCount,
    finalPosition: {
      x: finalX,
      y: finalY,
      z: finalZ
    },
    finalError
  }
}

const testDoubleDip = () => {
  const solution = _SolveDoubleDip(true);

  solution.data.forEach( (datum) => {
    console.log( `{x, y, z} and error = \t${datum.x.toFixed(18)}\t${datum.y.toFixed(18)}\t${datum.z.toFixed(18)}\t${datum.error.toFixed(18)}`)
    // console.log( `{x, y, z} and error = \t${datum.x.toFixed(18)}\t${datum.y.toFixed(18)}\t${datum.z.toFixed(18)}`)
  })
  console.log('\nThe swarm attempted to:')
  console.log('\tminimize f(x, y) = x * e^(-(x^2 + y^2) )')
  console.log(`\tsucceeded within ${solution.finalError} of optimal\n\tlost ${solution.beeDeaths} bees \n\ttook ${solution.epochCount} epochs`)
  console.log(`\tarrived at solution\n\t\tx: ${solution.finalPosition.x}\n\t\ty: ${solution.finalPosition.y}\n\t\tz: ${solution.finalPosition.z}\n`)
}

const solveDoubleDip = () => _SolveDoubleDip(false)

module.exports = {
  testDoubleDip,
  solveDoubleDip
}
},{"../SwarmChallenge":2,"../SwarmOfBees":3,"../formatters/textFormatters":4}]},{},[5]);
