// Google Sheets API implementtion
// https://developers.google.com/sheets/api/quickstart/nodejs

const sheets = require('../data/googleSheets')
const { fromA1, toA1 } = require('../../utils/sheets/A1Conversion')

let SHEET_ID = process.env.SHEET_ID

const headerMap = {
  'name': 'Kooli nimi',
  'county': 'Maakond',
  'municipality': 'Omavalitsus',
  'languages': 'Õppekeeled',
  'updatedAt': 'Uuendamise aeg'
}

const headerRange = sheet => `${sheet}!A1:R2`
const dataRange = ''

const cellCoordinates = {
  name: undefined,
  county: undefined,
  municipality: undefined,
  languages: undefined,
  classes: {
    '1': undefined,
    '2': undefined,
    '3': undefined,
    '4': undefined,
    '5': undefined,
    '6': undefined,
    '7': undefined,
    '8': undefined,
    '9': undefined,
    'G10': undefined,
    'G11': undefined,
    'G12': undefined,
  },
  updatedAt: undefined
}

const getRows = async range => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range
  })

  return response.data.values
}

// Finds all cells that match the given value in the given rows.
// Returns the relative A1 notation references as an array.
const findCells = (rows, value) => {
  let matches = []

  rows.forEach((row, iRow) => {
    row.forEach((cell, iCol) => {
      if (cell == value) {
        matches = matches.concat(toA1(iCol, iRow))
      }
    })
  })

  return matches
}

// Maps the headers to their cell coordinates on the sheet.
const mapCellCoordinates = async sheet => {
  const keys = Object.keys(headerMap)
  const range = headerRange(sheet)

  const rows = await getRows(range)

  const matchedCellCoordinates = cellCoordinates

  // Map non-class headers in the headers range
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const header = headerMap[key]

    const matchedCells = findCells(rows, header)
    const firstMatchCoordinates = matchedCells[0]

    matchedCellCoordinates[key] = firstMatchCoordinates
  }

  // Map class headers in the headers range
  const classHeaders =  Object.keys(cellCoordinates.classes)
  for (let i = 0; i < classHeaders.length; i++) {
    const header = classHeaders[i]

    const matchedCells = findCells(rows, header.replace('G', ''))
    const firstMatchCoordinates = matchedCells[0]

    matchedCellCoordinates.classes[header] = firstMatchCoordinates
  }

  return matchedCellCoordinates
}

const transfer = async _ => {
  const rows = await getRows(headerRange('Data'))
  console.log(rows)

  const cellMap = await mapCellCoordinates('Data')
  console.log(cellMap)


}

module.exports = transfer
