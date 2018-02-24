"use strict;"

const SwarmChallenge = require('../SwarmChallenge')
const SwarmOfBees = require('../SwarmOfBees')
const {
  formatVector
 } = require('../formatters/textFormatters')


const emitZYZandError = (x, y, z, err) => console.log( `{x, y, z} and error = \t${x.toFixed(18)}\t${y.toFixed(18)}\t${z.toFixed(18)}\t${err.toFixed(18)}`)

const doubleDip = (function (collectDataPointsFn) {
  _collectData = collectDataPointsFn

  _computeDoubleDip = (x, y) => x * Math.exp(-(x*x + y*y))

  // computes the error f(x0, x1) = x0 * e^(-(x0^2 + v1^2) )
  _computeDoubleDipErrorFn = (x) => {
    // 0.42888194248035300000 when x0 = -sqrt(2), x1 = 0
    const trueMin = -0.42888194; // true min for z = x * exp(-(x^2 + y^2))
    const z = _computeDoubleDip(x[0], x[1])
    const result = (z - trueMin) * (z - trueMin); // squared diff

    if (_collectData) _collectData(x[0], x[1], z, result)

    return result 
  }
  return {
    computeResult: _computeDoubleDip,
    computeError: _computeDoubleDipErrorFn
  }

})


const test = () => {
  const data = []
  const collectFn = (x, y, z, err) => data.push({x, y, z, error: err})
  // const collectFn = (x, y, z, err) => console.log( `{x, y, z} and error = \t${x.toFixed(18)}\t${y.toFixed(18)}\t${z.toFixed(18)}\t${err.toFixed(18)}`)
  const dblDip = doubleDip(collectFn)

  const challenge = new SwarmChallenge(
    2,
    5,
    dblDip.computeError,
    -10.0,
    10.0,
    1000,

    0.000000000000
  )


  const swarmOfBees = new SwarmOfBees(challenge)
  const solution = swarmOfBees.attack()
  console.log(`The swarm lost ${solution.beeDeaths} bees and took ${solution.epochCount} epochs resulting in an error of ${dblDip.computeError(solution.finalPosition)}`)
  const result = [solution.finalPosition[0], solution.finalPosition[1], dblDip.computeResult(solution.finalPosition[0], solution.finalPosition[1])]
  console.log(`The swarm's final position (x, y, z) was ${formatVector(result, 10, 3, true)}`)
  data.forEach( (datum) => {
    console.log( `{x, y, z} and error = \t${datum.x.toFixed(18)}\t${datum.y.toFixed(18)}\t${datum.z.toFixed(18)}\t${datum.error.toFixed(18)}`)
  })
}

module.exports = {test}