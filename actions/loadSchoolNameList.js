const clickXPath = require('../utils/clickXPath')

const scrollContainer = async (page, directionString, delta=1000) => {
  // Wait for the QVListContainer to show up before assigning to a variable
  await Promise.all([
    page.waitForXPath('//*[@id="42"]/div[2]/div')
  ])

  const directionMultipliers = {
    up: 1,
    down: -1
  }

  const direction = directionMultipliers[directionString]

  // QVListContainer with event listener for 'mousewheel'
  const schoolList = await page.$x('//*[@id="42"]/div[2]/div')
  const school = schoolList[0]

  await page.evaluate(async (el, delta, direction) => {
    const cEvent = new Event('mousewheel')

    cEvent.wheelDelta = delta * direction

    await el.dispatchEvent(cEvent)

  }, school, delta, direction)
}

const getSchoolNames = async page => {
  const schoolElements = await page.$x('//*[@id="42"]/div[2]/div/div[1]/div')

  const schoolNames = await schoolElements.map(async element => {
    const title = await page.evaluate(el => {
      return el.getAttribute('title')
    }, element)

    return title
  })

  return Promise.all(schoolNames)
}

const loadSchoolNameList = async page => {
  await Promise.all([
    clickXPath(page, `//*[@id="9"]/div[2]/div[1]/div[text() = 'Kooli nimi']`),
    page.waitForXPath(`//*[@id="42"]/div[1]/div[2]/div/div[text() = 'Kooli nimi']`)
  ])

  console.log('Scrolling school list container to the bottom...')
  // It seems like a combination of i < 30, deltaY = 1000, and 350ms delay works very well.
  // Further testing is still needed though.
  for (let i = 0; i < 30; i++) {
    await scrollContainer(page, 'down', 1000)
    await page.waitFor(350)
  }

  console.log('Loading names of all schools...')
  const schoolNames = await getSchoolNames(page)
  console.log(`Loaded names of ${schoolNames.length} schools`)

  return schoolNames
}

module.exports = loadSchoolNameList
