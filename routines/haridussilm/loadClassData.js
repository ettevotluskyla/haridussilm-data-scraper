const clickXPath = require('../../utils/web-interaction/clickXPath')
const simClickXPath = require('../../utils/web-interaction/simClickXPath')
const wrappedWaitForNetworkIdle = require('../../utils/web-interaction/wrappedWaitForNetworkIdle')

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

// page = frame to take actions in
// school = the name of the school to search in
const loadSchoolYearInfo = async (page, school, index) => {
  // Using double quotes here to escape potential single quotes in the school name
  const xpath = `//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`

  // Click the search icon
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, `//*[@id="42"]/div[1]/div[1]`),
    page.waitForXPath(`//*[@id="42"]/div[1]/div[1]`)
  ])

  // Type in the name of the school
  console.log(`Typing: ${school}`)
  await wrappedWaitForNetworkIdle(page, [
    page.keyboard.type(school, { delay: 0 }),
    // Wait for element to show up in list
    page.waitForXPath(`//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`)
  ])

  // Select the school from the search results
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, xpath),

    // Wait for page to update in addition to having no active requests
    page.waitFor(2000)
  ])

  // Unselect the school from the school list
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, xpath),

    // Wait for page to update in addition to having no active requests
    page.waitFor(1000)
  ])
}

const loadClassData = async (page, schools) => {
  for (let i = 0; i < schools.length; i++) {
    await loadSchoolYearInfo(page, schools[i], i)
    await page.waitFor(1000)
  }
}

module.exports = loadClassData
