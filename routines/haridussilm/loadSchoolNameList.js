const clickXPath = require('../../utils/web-interaction/clickXPath')
const scrollContainer = require('../../utils/web-interaction/scrollContainer')

const getSchoolNames = async page => {
  const schoolElements = await page.$x('//*[@id="144"]/div[2]/div/div[1]/div/div[2]/div[2]')

  const schoolNames = await schoolElements.map(async element => {
    const title = await page.evaluate(el => el.textContent, element)

    return title
  })

  return Promise.all(schoolNames)
}

const loadSchoolNameList = async page => {
  const schoolListTitle = 'Kooli nimi'

  Promise.resolve(clickXPath(page, `//*[@id="9"]/div[2]/div[1]/div[text() = '${schoolListTitle}']`,
    { waitXPath: `//*[@id="42"]/div[1]/div[2]/div/div[text() = '${schoolListTitle}']`}))

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
    waitBuffer: 350,
    waitEndDelay: 250
  })

  console.log('Loading names of all schools...')
  const schoolNames = await getSchoolNames(page)
  console.log(`Loaded names of ${schoolNames.length} schools`)

  return schoolNames
}

module.exports = loadSchoolNameList
