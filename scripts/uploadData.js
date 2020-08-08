const transfer = require('../routines/google-sheets/transferDataToSheets')
const { getSchools } = require('../routines/data/datastore')

const uploadData = async _ => {
  schools = await getSchools()
  await transfer(schools)
}

uploadData()
