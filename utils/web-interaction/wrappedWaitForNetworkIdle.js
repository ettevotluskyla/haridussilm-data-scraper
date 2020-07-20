// Workaround for wrapping promises that need to wait for network activity
// that isn't a result of navigation to end before continuing.
//
// Modified implementation based on these GitHub answers:
// https://github.com/puppeteer/puppeteer/issues/1278#issuecomment-638524079
// https://github.com/puppeteer/puppeteer/issues/5328#issuecomment-622089722

// Wait for network to be idle
// That means that no new requests have been made in the past 500 ms.
// Default timeout is 15 s, throws error if that ends before network idle.
const waitForNetworkIdle = async (page, pollRate = 500, timeout = 15*1000, maxInflightRequests = 0) => {
  let inflightRequests
  const onRequestStarted = _ => (inflightRequests = inflightRequests + 1)
  const onRequestFinished = _ => (inflightRequests = inflightRequests - 1)

  page.on('request', onRequestStarted)
  page.on('requestfailed', onRequestFinished)
  page.on('requestfinished', onRequestFinished)

  return async (success = false) => {
    while (true) {
      if (inflightRequests <= maxInflightRequests) {
        break
      }

      // Poll rate means that no new requests have to be made in the past
      // x milliseconds.
      await new Promise(x => setTimeout(x, pollRate))

      if ((timeout - pollRate) >= 0) {
        // Decrement timeout if not already ended
        timeout = timeout - pollRate
      } else {
        // Throw on timeout end
        throw new Error('Timeout occurred while waiting for network idle')
      }
    }

    page.removeListener('request', onRequestStarted)
    page.removeListener('requestfailed', onRequestFinished)
    page.removeListener('requestfinished', onRequestFinished)
  }
}


const waitForNetworkAndPromises = async (page, promises = [], timeout, pollRate, maxInflightRequests) => {
  return await Promise.all([
      ...promises,
      waitForNetworkIdle(
        page,
        pollRate,
        timeout,
        pollRate,
        maxInflightRequests
      )
  ])
}

module.exports = waitForNetworkAndPromises
