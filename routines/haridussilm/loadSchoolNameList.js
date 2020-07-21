const clickXPath = require('../../utils/web-interaction/clickXPath')
const scrollContainer = require('../../utils/web-interaction/scrollContainer')
const switchToMenu = require('../../utils/web-interaction/switchToMenu')

// URL of embedded iframe at haridussilm.ee
const hsUrl = 'https://www.haridussilm.ee/QvAJAXZfc/opendoc_hm.htm?document=htm_avalik.qvw&host=QVS%40qlikview-pub&anonymous=true&sheet=SH_alus_yld_2'

const getSchoolNames = async page => {
  const elements = await page.$x('//*[@id="42"]/div[2]/div/div[1]/div/div[2]/div[2]')
  const schoolNames = elements.map(element => {
    return page.evaluate(el => {return el.textContent}, element)
  })

  return Promise.all(schoolNames)
}

const loadSchoolNameList = async page => {
  // Wait for page load by looking at # of active network connections
  if(process.customOptions.verbose) {
    console.log(`Loading page ${hsUrl}`)
  }

  await page.goto(hsUrl, { waitUntil: 'networkidle0' })

  if(process.customOptions.verbose) {
    console.log(`Loaded`)
  }

  const schoolListTitle = 'Kooli nimi'

  await switchToMenu(page, schoolListTitle)

  // Element (list) containing all the names of the schools.
  const schoolListXpath = '//*[@id="42"]/div[2]/div'

  // Scroll the school list to the bottom.
  // It seems like a combination of the following works well:
  // scrollCount = 30, deltaY = 1000, waitBuffer = 350ms.
  // Further testing is still needed though.
  await scrollContainer(page, schoolListXpath, {
    direction: 'down',
    delta: 1000,
    scrollCount: 30,
    title: schoolListTitle,
    waitBuffer: 0,
    waitEndDelay: 250
  })

  const schoolNames = await getSchoolNames(page)
  if(process.customOptions.verbose) {
    console.log(`Loaded names of ${schoolNames.length} schools`)
  }

  await page.close()
  await page.browser().close()

  return schoolNames
}

module.exports = loadSchoolNameList
