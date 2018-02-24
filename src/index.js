
const {solveDoubleDip} = require('./tests/swarm-test')

//test()

function getTestData() {return solveDoubleDip() }

if (!window['Swarming']) {
  window['Swarming'] = {
    getTestData
  }
}

module.exports = {getTestData}