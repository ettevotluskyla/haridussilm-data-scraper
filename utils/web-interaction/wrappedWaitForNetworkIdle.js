// Workaround for wrapping promises that need to wait for network activity
// that isn't a result of navigation to end before continuing.
//
// Modified implementation based on these GitHub answers:
// https://github.com/puppeteer/puppeteer/issues/1278#issuecomment-638524079
// https://github.com/puppeteer/puppeteer/issues/5328#issuecomment-622089722

// Wait for network to be idle
// That means that no new requests have been made in the past 500 ms.
// Default timeout is 15 s, throws error if that ends before network idle.
//
// TODO: Think about a waiting timeout. E.g. if the network is not idle within
// 15 seconds, throw an error. Maybe use Promise.race with setTimeout for this.
const waitForNetworkIdle = async (page, timeout = 500, maxInflightRequests = 0) => {
  if (process.customOptions.verbose) {
    console.time('Network wait took ')
  }
  let inflightRequests = 0
  let fulfill
  let promise = new Promise(x => fulfill = x)

  const onRequestStarted = _ => {
    ++inflightRequests
    if (inflightRequests > maxInflightRequests)
      clearTimeout(timeoutId)
  }

  const onRequestFinished = _ => {
    if (inflightRequests === 0) {
      return
    }

    --inflightRequests

    if (inflightRequests === maxInflightRequests)
      timeoutId = setTimeout(onTimeoutDone, timeout);
  }

  const onTimeoutDone = _ => {
    page.removeListener('request', onRequestStarted)
    page.removeListener('requestfailed', onRequestFinished)
    page.removeListener('requestfinished', onRequestFinished)

    if (process.customOptions.verbose) {
      console.timeEnd('Network wait took ')
    }

    fulfill()
  }

  let timeoutId = setTimeout(onTimeoutDone, timeout)

  page.on('request', onRequestStarted)
  page.on('requestfailed', onRequestFinished)
  page.on('requestfinished', onRequestFinished)

  return promise
}


const waitForNetworkAndPromises = async (page, promises = [], timeout, maxInflightRequests) => {
  return await Promise.all([
      ...promises,
      waitForNetworkIdle(
        page,
        timeout,
        maxInflightRequests
      )
  ])
}

module.exports = waitForNetworkAndPromises
