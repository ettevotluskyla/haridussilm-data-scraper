const { AsyncNedb } = require('nedb-async')
const db = new AsyncNedb({
  filename: 'data/schools.db',
  timestampData: true,
  autoload: true
})

const addSchool = async school => {
  try {
    await db.asyncUpdate({name: school}, school, { upsert: true })
  } catch (e) {
    throw e
  }
}

const addSchools = async schools => {
  for (let i = 0; i < schools.length; i++) {
    await addSchool(schools[i])
  }
}

const getSchool = async school => {
  return await db.asyncFindOne({ name: school })
}

const getSchools = async _ => {
  return await db.asyncFind({})
}

const compact = async _ => {
  await db.persistence.compactDatafile()
}

module.exports = {
  saveSchool: addSchool,
  saveSchools: addSchools,
  getSchool: getSchool,
  getSchools: getSchools,
  compact: compact
}
