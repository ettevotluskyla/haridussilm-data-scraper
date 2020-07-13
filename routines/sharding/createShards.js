const createChunks = (array, chunkSize) => {
    let chunks = []

    for (let i = 0; i < array.length; i += chunkSize) {
        chunk = array.slice(i, i+chunkSize)
        chunks = chunks.concat([chunk])
    }

    return chunks;
}

const createShards = async (browser, schoolNames, shardSize=30) => {
  let shards = []

  const chunkedNames = createChunks(schoolNames, shardSize)

  for (let i = 0; i < chunkedNames.length; i++) {
    const page = await browser.newPage()
    shards[`${i}`] = {
      done: false,
      page: page,
      schools: chunkedNames[i]
    }
  }

  return shards
}

module.exports = createShards
