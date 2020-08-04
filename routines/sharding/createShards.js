const { getSchools } = require('../../routines/data/datastore')

const createChunks = (array, chunkSize) => {
    let chunks = []

    for (let i = 0; i < array.length; i += chunkSize) {
        chunk = array.slice(i, i+chunkSize)
        chunks = chunks.concat([chunk])
    }

    return chunks;
}

const createShards = async (schoolNames, shardSize=30) => {
  let shards = []

  let names = schoolNames

  if (process.customOptions.useCache) {
    const cachedSchools = await getSchools()

    const cachedNames = cachedSchools.map(school => school.name)

    names = schoolNames.filter(el => cachedNames.indexOf(el) == -1)
  }

  const chunkedNames = createChunks(names, shardSize)

  for (let i = 0; i < chunkedNames.length; i++) {
    shards[`${i}`] = {
      schools: chunkedNames[i]
    }
  }

  console.log(`Created ${chunkedNames.length} shards with ${names.length} schools.`)

  return shards
}

module.exports = createShards
