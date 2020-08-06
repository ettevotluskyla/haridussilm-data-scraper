const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Converts sheets column labels into numeric indexes
const columnAlphaToIndex = alpha => {
  let index = 0

  // Remove all numbers from string
  let strippedAlpha = alpha.replace(/([0-9])+/g, '')

  for (let i = 0; i < strippedAlpha.length; i++) {

    if (strippedAlpha.length > 1) {
      // If not last element in array
      if (i <strippedAlpha.length-1) {
        index += letters.length
      } else {
        index += letters.indexOf(strippedAlpha[i])
      }
    } else {
      index += letters.indexOf(strippedAlpha[i])
    }
  }

  return index
}

// Converts numeric index into sheets column label
const columnIndexToAlpha = index => {
  let alpha = ''

  if (index < letters.length) {
    alpha = letters[index]
  } else {
    const full = Math.floor(index / letters.length)
    const remainder = index % letters.length

    alpha = `${letters[0].repeat(full)}${letters[remainder]}`
  }

  return alpha
}

// Convert a single cell from a1 notation to a row-column index pair
const fromA1 = alpha => {
  let row = 0,
      column = 0

  const strippedAlpha = alpha.replace('$', '')

  column = columnAlphaToIndex(alpha)
  // Remove all letters from the a1 notation provided (case insensitive)
  row = parseInt(strippedAlpha.replace(/([a-z])+/gi, '')) - 1

  return { row: row, column: column }
}

const toA1 = (column, row) => {
  return `${columnIndexToAlpha(column)}${row+1}`
}

module.exports = {
  columnAlphaToIndex: columnAlphaToIndex,
  columnIndexToAlpha: columnIndexToAlpha,
  toA1: toA1,
  fromA1: fromA1
}
