const { Cluster } = require('puppeteer-cluster');
const runShard = require('./runShard')

const createShardCluster = async (shards) => {
  const { maxConcurrency, headless, monitor} = process.customOptions
  const dumpio = process.customOptions.verbose

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: maxConcurrency,
    // Max safe 32-bit integer
    timeout: 2147483647,
    puppeteerOptions: {
      headless: headless,
      devtools: false,
      dumpio: dumpio},
    monitor: monitor
  })

  shards.forEach(shard => cluster.queue(shard, runShard))

  // Capture errors in shards
  cluster.on('taskerror', (err, data, willRetry) => {
    if (willRetry) {
      console.warn(`[ERROR] Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`)
    } else {
      console.error(`[ERROR] Failed to crawl ${data}: ${err.message} \nStacktrace: \n${err.stack}`)
    }
  })

  await cluster.idle()
  await cluster.close()
}

module.exports = createShardCluster
