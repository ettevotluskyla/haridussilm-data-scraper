const clickXPath = require('./clickXPath')
const wrappedWaitForNetworkIdle = require('./wrappedWaitForNetworkIdle')
const retry = require('async-retry')

const switchToMenu = async (page, menu) => {
  const xpath = `//*[@id="9"]/div[2]/div[1]/div[text() = '${menu}']`
  const listTitleXPath = `//*[@class='QvCaption']/div/div/div[text() = '${menu}']/../../../..`

  await wrappedWaitForNetworkIdle(page, [
    clickXPath(page, xpath, {
      waitXPath: listTitleXPath,
      waitDelay: 1000
    })
  ])

  await retry(async bail => {

  }, { retries: 5 })

}

module.exports = switchToMenu
