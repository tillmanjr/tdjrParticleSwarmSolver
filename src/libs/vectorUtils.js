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