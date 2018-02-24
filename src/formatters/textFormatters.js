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