const switchToMenu = require('../../utils/web-interaction/switchToMenu')
const loadSchoolData = require('../haridussilm/loadSchoolData')

// URL of embedded iframe at haridussilm.ee
const hsUrl = 'https://www.haridussilm.ee/QvAJAXZfc/opendoc_hm.htm?document=htm_avalik.qvw&host=QVS%40qlikview-pub&anonymous=true&sheet=SH_alus_yld_2'

const runShard = async ({ page, data: shard}) => {
  const { schools } = shard

  const headless = process.customOptions.headless
  if (!headless) {
    const browser = await page.browser()
    const pages = await browser.pages()

    for (let i = 0; i < pages.length; i++) {
      if (!Object.is(pages[i], page)) {
        pages[i].close()
      }
    }
  }

  await page.goto(hsUrl, { waitUntil: 'networkidle0' })

  await switchToMenu(page, 'Kooli nimi')

  await page.waitFor(250)

  const schoolData = await loadSchoolData(page, schools)

  if(process.customOptions.verbose) {
    console.log(schoolData)
  }

  await page.waitFor(0)
}

module.exports = runShard
