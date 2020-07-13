const clickXPath = require('../../utils/web-interaction/clickXPath')
const simClickXPath = require('../../utils/web-interaction/simClickXPath')
const wrappedWaitForNetworkIdle = require('../../utils/web-interaction/wrappedWaitForNetworkIdle')
const switchToMenu = require('../../utils/web-interaction/switchToMenu')

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

// Click the search icon and type the name of the school.
const searchList = async (page, school) => {
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
    page.waitForXPath(`//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`),

    // Wait for page to update
    page.waitFor(750)
  ])
}

// Select school in the school list
const selectSchool = async (page, school) => {
  // Using double quotes here to escape potential single quotes in the school name
  const xpath = `//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`

  await searchList(page, school)

  // Select the school from the search results
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, xpath),

    // Wait for page to update in addition to having no active requests
    page.waitFor(1000)
  ])
}

// Deselect school in the school list
// Setting research to true will reenter the school name in the search box before
// clicking the item. Defaults to false to improve performance.
const deselectSchool = async (page, school, research=false) => {
  // Using double quotes here to escape potential single quotes in the school name
  const xpath = `//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`

  if (research) {
    await searchList(page, school)
  }

  // Unselect the school from the school list
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, xpath),

    // Wait for page to update in addition to having no active requests
    page.waitFor(750)
  ])
}

const getAvailableClasses = async (page, school) => {
  const activeClassName = 'QvOptional_LED_CHECK_363636'
  const inactiveClassName = 'QvExcluded_LED_CHECK_363636'
  const classes = Object.keys(levels)

  let availableClasses = []

  for (let i = 0; i < classes.length; i++) {
    // Look for non-disabled elements in the list
    const classID = classes[i]
    const xpath = `//*[@id="48"]/div[2]/div/div[1]/div[@title = '${classID}' and @class = '${activeClassName}']`
    const classElement = await page.$x(xpath)

    if (classElement.length > 0) {
      availableClasses = availableClasses.concat(classes[i])
    }
  }

  //console.log(availableClasses)
  console.log(`Found classes ${availableClasses.toString()} for ${school}`)
  return availableClasses
}

const selectClass = async (page, classID) => {

}

const deselectClass = async (page, classID) => {

}

// page = frame to take actions in
// school = the name of the school to search in
const loadSchoolYearInfo = async (page, school) => {
  await selectSchool(page, school)

  await switchToMenu(page, 'Klass')
  const availableClasses = await getAvailableClasses(page, school)

  await switchToMenu(page, 'Kooli nimi')
  await deselectSchool(page, school)
}

const loadClassData = async (page, schools) => {
  const upperBound = true ? schools.length : 0

  for (let i = 0; i < upperBound; i++) {
    console.log('------------------------------------')
    console.log(schools[i].toUpperCase())
    await loadSchoolYearInfo(page, schools[i], i)
    await page.waitFor(0)
  }
}

module.exports = loadClassData
