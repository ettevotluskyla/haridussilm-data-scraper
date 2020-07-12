const puppeteer = require('puppeteer')

const loadSchoolNameList = require('../routines/haridussilm/loadSchoolNameList')
const loadSchoolData = require('../routines/haridussilm/loadSchoolData')

// URL of embedded iframe at haridussilm.ee
const hsUrl = 'https://www.haridussilm.ee/QvAJAXZfc/opendoc_hm.htm?document=htm_avalik.qvw&host=QVS%40qlikview-pub&anonymous=true&sheet=SH_alus_yld_2'

const fullRoutine = async () => {
  const headless = false
  const browser = await puppeteer.launch({ 'headless': headless })

  // Create a new page if headless, use default about:blank page if not
  let page
  if (headless) {
    page = await browser.newPage()
  } else {
    pages = await browser.pages()
    page = pages[0]
  }

  // Wait for page load by looking at # of active network connections
  console.log(`Loading page ${hsUrl}`)
  await page.goto(hsUrl, { waitUntil: 'networkidle0' })
  console.log(`Loaded`)

  // Loads the whole list of school names from the site
  const schoolNames = await loadSchoolNameList(page)

  await page.waitFor(250)

  // Loads school data based on school name list
  console.log(`Loading school data for ${schoolNames.length} schools.`)
  const schoolData = await loadSchoolData(page, schoolNames)

  // await browser.close()
}

fullRoutine()
