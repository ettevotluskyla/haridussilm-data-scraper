const { PerformanceObserver, performance } = require('perf_hooks')
const { v4: uuid } = require('uuid');

// Workaround for wrapping promises that need to wait for network activity
// that isn't a result of navigation to end before continuing.
//
// Modified implementation based on these GitHub answers:
// https://github.com/puppeteer/puppeteer/issues/1278#issuecomment-638524079
// https://github.com/puppeteer/puppeteer/issues/5328#issuecomment-622089722

// Wait for network to be idle
// That means that no new requests have been made in the past 500 ms.
//
// TODO: Think about a waiting timeout. E.g. if the network is not idle within
// 15 seconds, throw an error. Maybe use Promise.race with setTimeout for this.
const waitForNetworkIdle = async (page, timeout = 500, maxInflightRequests = 0, performanceId) => {

  if (process.customOptions.verbose) {
    performanceId = performanceId || uuid()

    performance.mark(`network-idle-${performanceId}-start`)
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

    // Send performance measurement of waiting for the network to the console.
    if (process.customOptions.verbose) {
      performance.mark(`network-idle-${performanceId}-end`)
      performance.measure(
        `network-idle-${performanceId}`,
        `network-idle-${performanceId}-start`,
        `network-idle-${performanceId}-end`
      )

      obs = new PerformanceObserver((list, observer) => {
        const entry = list.getEntries()[0]
        console.log(`Wait for '${entry.name}' took`, entry.duration, `ms`)

        performance.clearMarks(`network-idle-${performanceId}-start`)
        performance.clearMarks(`network-idle-${performanceId}-end`)
        observer.disconnect()
      })

      obs.observe({ entryTypes: ['measure'], buffered: false })
    }

    fulfill()
  }

  let timeoutId = setTimeout(onTimeoutDone, timeout)

  page.on('request', onRequestStarted)
  page.on('requestfailed', onRequestFinished)
  page.on('requestfinished', onRequestFinished)

  return promise
}


const waitForNetworkAndPromises = async (page, promises = [], timeout, maxInflightRequests, performanceId) => {
  return await Promise.all([
      ...promises,
      waitForNetworkIdle(
        page,
        timeout,
        maxInflightRequests,
        performanceId
      )
  ])
}

module.exports = waitForNetworkAndPromises
