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

  const chunkedNames = createChunks(schoolNames, shardSize)

  for (let i = 0; i < chunkedNames.length; i++) {
    shards[`${i}`] = {
      schools: chunkedNames[i]
    }

    console.log(chunkedNames[i])
  }

  return shards
}

module.exports = createShards
