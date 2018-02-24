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