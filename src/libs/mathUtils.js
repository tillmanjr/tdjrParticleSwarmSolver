"use strict;"



const computePositionError = (x) => {
  // 0.42888194248035300000 when x0 = -sqrt(2), x1 = 0
  const trueMin = -0.42888194; // true min for z = x * exp(-(x^2 + y^2))
  const z = x[0] * Math.exp( -((x[0]*x[0]) + (x[1]*x[1])) );
  return (z - trueMin) * (z - trueMin); // squared diff
}

module.exports = {
  computePositionError
}