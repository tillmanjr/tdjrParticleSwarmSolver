

const {
  doubleDipPlotData,
  solveDoubleDip
} = require('./tests/swarm-test')

//test()

function getDoubleDipPlotData() { return doubleDipPlotData() }
function getTestData() { return solveDoubleDip() }

if (!window['Swarming']) {
  window['Swarming'] = {
    getDoubleDipPlotData,
    getTestData
  }
}

module.exports = {
  getDoubleDipPlotData,
  getTestData
}