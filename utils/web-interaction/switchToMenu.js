const clickXPath = require('./clickXPath')
const wrappedWaitForNetworkIdle = require('./wrappedWaitForNetworkIdle')

const switchToMenu = async (page, menu) => {
  const xpath = `//*[@id="9"]/div[2]/div[1]/div[text() = '${menu}']`
  const listTitleXPath = `//*[@id="42"]/div[1]/div[2]/div/div[text() = '${menu}']`

  await wrappedWaitForNetworkIdle(page, [
    clickXPath(page, xpath, { waitXPath: listTitleXPath })
  ])

}

module.exports = switchToMenu
