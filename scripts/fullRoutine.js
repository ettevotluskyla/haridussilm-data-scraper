const puppeteer = require('puppeteer')
const args = require('minimist')(process.argv.slice(2))

const loadSchoolNameList = require('../routines/haridussilm/loadSchoolNameList')
const loadSchoolData = require('../routines/haridussilm/loadSchoolData')
const createShards = require('../routines/sharding/createShards')
const runShardCluster = require('../routines/sharding/runShardCluster')
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

  const blockResources = args['block-resources']
                ? (args['block-resources'] == 'true' || args['block-resources'] == true)
                : false

  const useCache = args['use-cache']
                ? (args['use-cache'] == 'true' || args['use-cache'] == true)
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
    maxConcurrency: maxConcurrency,
    blockResources: blockResources,
    useCache: useCache
  }

  process.customOptions = customOptions

  return customOptions
})()

const initPuppeteer = async headless => {
  const browser = await puppeteer.launch({
    headless: headless,
    defaultViewport: {
      width: 1200,
      height: 800
    },
    args: [
      '--no-sandbox',
      '--no-zygote',
      '--disable-gpu',
      '--disable-features=VizDisplayCompositor',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--window-size=1200,800'
    ]
  })

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

  await runShardCluster(shards)


}

fullRoutine()
