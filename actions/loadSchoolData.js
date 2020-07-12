const clickXPath = require('../utils/clickXPath')

// List of school years to look for
// Taken from HaridusSilm
const schoolYears = ['05/06', '06/07', '07/08', '08/09', '09/10', '10/11',
                     '11/12', '12/13', '13/14', '14/15', '15/16', '16/17',
                     '17/18', '18/19', '19/20']

// A map of classes to school levels for data collection
// Taken from HaridusSilm
const levels = {
  '1': '1. kooliaste',
  '2': '1. kooliaste',
  '3': '1. kooliaste',
  '4': '2. kooliaste',
  '5': '2. kooliaste',
  '6': '2. kooliaste',
  '7': '3. kooliaste',
  '8': '3. kooliaste',
  '9': '3. kooliaste',
  'G10': 'gümnaasium',
  'G11': 'gümnaasium',
  'G12': 'gümnaasium',
}

// Clicks in the middle of the provided element using the mouse
const clickOnElement = async (page, xpath) => {
  console.log(`Clicking (full sim): ${xpath}`)
  const element = await page.$x(xpath)

  const bounds = await page.evaluate(el => {
    const { top, left, width, height } = el.getBoundingClientRect()
    return { top, left, width, height }
  }, element[0])

  // Use given position or default to center
  const xOffset = bounds.width / 2;
  const yOffset = bounds.height / 2;

  await page.waitFor(100)
  await page.mouse.click(bounds.left + xOffset, bounds.top + yOffset)
}

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

// page = frame to take actions in
// school = the name of the school to search in
const loadSchoolYearInfo = async (page, school, index) => {
  const xpath = `//*[@id="42"]/div[2]/div/div[1]/div[@title = '${school}']`

  // Click the search icon
  await Promise.all([
    clickOnElement(page, `//*[@id="42"]/div[1]/div[1]`),
    page.waitFor(500)
  ])

  // Type in the name of the school
  console.log(`Typing: ${school}`)
  await Promise.all([
    await page.keyboard.type(school, { delay: 0 }),
    // Wait for search to complete
    page.waitFor(500)
  ])

  // Select the school from the search results
  await Promise.all([
    clickOnElement(page, xpath),

    // Wait for page to update
    page.waitFor(2000)
  ])

  // Unselect the school from the school list
  await Promise.all([
    clickOnElement(page, xpath),

    // Wait for page to update
    page.waitFor(1000)
  ])
}

const loadSchoolData = async (page, schools) => {
  for (let i = 0; i < schools.length; i++) {
    await loadSchoolYearInfo(page, schools[i], i)
    await page.waitFor(1000)
  }
}

module.exports = loadSchoolData
