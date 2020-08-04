// Valikud nimekirjas:
//
// QvExcluded - ei saa valida seda valikut
// QVOptional - saab valida seda valikut
//
// Selle järgi saab aru, mis maakonnas ja omavalitsuses kool asub
// ning mis keeli koolis räägitakse.

const Datastore = require('nedb')
const db = new Datastore({ filename: 'data/school-db', autoload: true })

const addSchool = async school => {
  try {
    console.log(school)
    await db.insert(school)
  } catch (e) {
    throw e
  }
}

const addSchools = async schools => {
  for (let i = 0; i < schools.length; i++) {
    await addSchool(schools[i])
  }
}

const getSchools = async _ => {
  return undefined
}

module.exports = {
  saveSchool: addSchool,
  saveSchools: addSchools,
  getSchools: getSchools
}
