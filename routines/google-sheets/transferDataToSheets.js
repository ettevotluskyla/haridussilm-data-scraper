// Google Sheets API implementtion
// https://developers.google.com/sheets/api/quickstart/nodejs

const getSheets = require('../data/googleSheets')
const { fromA1, toA1 } = require('../../utils/sheets/A1Conversion')
const { DateTime } = require('luxon')

let SHEET_ID = process.env.SHEET_ID

// Years to upload to the Google Sheets
const years = ['05/06', '06/07', '07/08', '08/09', '09/10', '10/11',
                     '11/12', '12/13', '13/14', '14/15', '15/16', '16/17',
                     '17/18', '18/19', '19/20']

const headerMap = {
  name: 'Kooli nimi',
  county: 'Maakond',
  municipality: 'Omavalitsus',
  languages: 'Õppekeeled',
  updatedAt: 'Uuendamise aeg',
  totalStudents: 'Koolis kokku',
  totalElementary: 'AK kokku',
  totalMiddle: 'PK kokku',
  totalHigh: 'G kokku'
}

const headerRange = sheet => `${sheet}!A1:U2`

// This may not be needed, but I've kept it as reference.
let cellCoordinates = {
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
  updatedAt: undefined,
  totalStudents: undefined,
  totalElementary: undefined,
  totalMiddle: undefined,
  totalHigh: undefined
}

const getRows = async (sheets, range) => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range
  })

  return response.data.values
}

const createRow = (school, range) => {
  const parts = range.split('!')
  const sheet = parts[0]
  const year = sheet
  const [ start, end ] = parts[1].split(':')

  const length = fromA1(end).column+1 - fromA1(start).column
  let row = new Array(length)
  row.fill('', fromA1(start).column, fromA1(end).column+1)

  const classes = Object.keys(cellCoordinates.classes)
  const metaInfo = Object.keys(headerMap)

  classes.forEach(id => {
    if (school.classes[id]) {
      const index = cellCoordinates.classes[id].col
      row[index] = school.classes[id][year]
    }
  })

  metaInfo.forEach(variable => {
    if (cellCoordinates[variable]) {
      const index = cellCoordinates[variable].col

      let value = school[variable]

      if (Array.isArray(school[variable])) {
        value = school[variable].toString()
      }

      // Format the date in the DB into something that Google Sheets can parse.
      if (variable == 'updatedAt') {
        const updatedAt = DateTime.fromJSDate(school[variable])
                                  .toFormat('MMM dd, yyyy HH:mm:ss')
                                  .toString()
        value = updatedAt
      }

      if (variable == 'totalElementary') {
        const headers = ['1', '2', '3', '4']
        const cells = headers.map(_class => {
          return toA1(cellCoordinates.classes[_class].col, fromA1(start).row)
        })

        const formula = `=SUM(${cells.toString()})`

        value = formula
      }

      if (variable == 'totalMiddle') {
        const headers = ['5', '6', '7', '8', '9']
        const cells = headers.map(_class => {
          return toA1(cellCoordinates.classes[_class].col, fromA1(start).row)
        })

        const formula = `=SUM(${cells.toString()})`

        value = formula
      }

      if (variable == 'totalHigh') {
        const headers = ['G10', 'G11', 'G12']
        const cells = headers.map(_class => {
          return toA1(cellCoordinates.classes[_class].col, fromA1(start).row)
        })

        const formula = `=SUM(${cells.toString()})`

        value = formula
      }

      if (variable == 'totalStudents') {
        const headers = Object.keys(cellCoordinates.classes)
        const cells = headers.map(_class => {
          return toA1(cellCoordinates.classes[_class].col, fromA1(start).row)
        })

        const formula = `=SUM(${cells.toString()})`

        value = formula
      }

      row[index] = value
    }
  })

  return row
}

// Finds all cells that match the given value in the given rows.
// Returns the relative A1 notation references as an array.
const findCells = (rows, value) => {
  let matches = []

  rows.forEach((row, iRow) => {
    row.forEach((cell, iCol) => {
      if (cell == value) {
        matches = matches.concat({ col: iCol, row: iRow, a1: toA1(iCol, iRow) })
      }
    })
  })

  return matches
}

// Maps the headers to their cell coordinates on the sheet.
const mapCellCoordinates = async (sheets, sheet) => {
  const keys = Object.keys(headerMap)
  const range = headerRange(sheet)

  const rows = await getRows(sheets, range)

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

  cellCoordinates = matchedCellCoordinates
  return matchedCellCoordinates
}

const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay))

const uploadChunk = async (schools, year, startIndex) => {
  const sheets = await getSheets()
  const sheet = year

  await mapCellCoordinates(sheets, sheet)

  const rows = schools.map((school, index) => {
    const rowRefs = {
      start: toA1(
        cellCoordinates.name.col,
        cellCoordinates.name.row+1+startIndex+index
      ),
      end: toA1(
        cellCoordinates.updatedAt.col,
        cellCoordinates.updatedAt.row+1+startIndex+index
      )
    }

    const range = `${sheet}!${rowRefs.start}:${rowRefs.end}`
    const request = createRow(school, range)

    return request
  })

  const batchRefs = {
    start: toA1(
      cellCoordinates.name.col,
      cellCoordinates.name.row+1+startIndex
    ),
    end: toA1(
      cellCoordinates.updatedAt.col,
      cellCoordinates.updatedAt.row+startIndex+schools.length
    )
  }

  const batchRange = `${sheet}!${batchRefs.start}:${batchRefs.end}`

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      // USER_ENTERED is required for numbers to be numbers and strings to be strings.
      valueInputOption: 'USER_ENTERED',
      data: [{
        range: batchRange,
        values: rows
      }]
    }
  })
}

const createChunks = (array, chunkSize) => {
    let chunks = []

    for (let i = 0; i < array.length; i += chunkSize) {
        chunk = array.slice(i, i+chunkSize)
        chunks = chunks.concat([chunk])
    }

    return chunks;
}

const transfer = async schools => {
  // Sort schools alphabetically
  const sortedSchools = Array.from(schools).sort((a, b) => {
    return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
  })

  const chunkedSchools = createChunks(sortedSchools, 300)

  // Run through all the schoolyears.
  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    console.log(`Uploading data for schoolyear ${year}`)

    // Run through all the chunks for the schoolyear.
    for (let j = 0; j < chunkedSchools.length; j++) {
      const chunk = chunkedSchools[j]
      const startIndex = sortedSchools.indexOf(chunk[0])

      console.time(`Chunk ${j+1}/${chunkedSchools.length} for schoolyear ${year} uploaded`)

      await Promise.all([
        uploadChunk(chunk, year, startIndex),
        waitFor(500)
      ])

      console.timeEnd(`Chunk ${j+1}/${chunkedSchools.length} for schoolyear ${year} uploaded`)
    }
  }
}

module.exports = transfer
