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