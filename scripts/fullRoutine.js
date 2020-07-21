const puppeteer = require('puppeteer')
const args = require('minimist')(process.argv.slice(2))

const loadSchoolNameList = require('../routines/haridussilm/loadSchoolNameList')
const loadSchoolData = require('../routines/haridussilm/loadSchoolData')
const createShards = require('../routines/sharding/createShards')
const createShardCluster = require('../routines/sharding/createShardCluster')
const runShard = require('../routines/sharding/runShard')

const customOptions = (async _ => {
  const headless = args['headless']
                 ? (args['headless'] == 'true' || args['headless'] == true)
                 : false

  // Default to no sharding unless sharding argument is passed
  const shouldShard = args['sharding']
                    ? (args['sharding'] == 'true' || args['sharding'] == true)
                    : false

  const verbose = args['verbose']
                ? (args['verbose'] == 'true' || args['verbose'] == true)
                : false

  const monitor = args['monitor']
                ? (args['monitor'] == 'true' || args['monitor'] == true)
                : false

  // Shard size gets overwritten later if sharding is disabled
  const shardSize = args['shardSize'] ? args['shardSize'] : 15

  let maxConcurrency
  if (shouldShard) {
    maxConcurrency = args['maxConcurrency'] ? args['maxConcurrency'] : 5
  } else {
    maxConcurrency = 1
  }

  const customOptions = {
    headless: headless,
    shouldShard: shouldShard,
    verbose: verbose,
    monitor: monitor,
    shardSize: shardSize,
    maxConcurrency: maxConcurrency
  }

  process.customOptions = customOptions

  return customOptions
})()

const initPuppeteer = async headless => {
  const browser = await puppeteer.launch({ 'headless': headless })

  // Create a new page if headless, use default about:blank page if not
  let page
  if (headless) {
    page = await browser.newPage()
  } else {
    pages = await browser.pages()
    page = pages[0]
  }

  return { browser, page }
}

const fullRoutine = async _ => {
  const options = await customOptions
  const { headless, shouldShard } = options

  console.log('Starting with options:\n')
  console.log(options)

  const { browser, page } = await initPuppeteer(headless)

  // Loads the whole list of school names from the site
  const schoolNames = await loadSchoolNameList(page)

  await page.waitFor(500)

  const shardSize = shouldShard ? process.customOptions.shardSize : schoolNames.length
  const shards = await createShards(schoolNames, process.customOptions.shardSize)
  console.log(`Loading school data for ${schoolNames.length} schools.`)
  const shardCluster = await createShardCluster(shards)
}

fullRoutine()
