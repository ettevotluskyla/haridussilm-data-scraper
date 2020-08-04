const clickXPath = require('../../utils/web-interaction/clickXPath')
const simClickXPath = require('../../utils/web-interaction/simClickXPath')
const wrappedWaitForNetworkIdle = require('../../utils/web-interaction/wrappedWaitForNetworkIdle')
const switchToMenu = require('../../utils/web-interaction/switchToMenu')
const scrollContainer = require('../../utils/web-interaction/scrollContainer')

const { saveSchool, getSchools } = require('../data/datastore')

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

const textInsertPromise = async (page, text) => {
  const searchBox = await page.$x(`//div[@class = 'PopupSearch']/input`)

  await page.evaluate((el, text) => { el.value = text }, searchBox[0], text)

  if(process.customOptions.verbose) {
     console.log(`Inserted text into search box for ${text}`)
  }
}

// Click the search icon and type the name of the school.
const searchList = async (page, school) => {
  // Click the search icon
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, `//*[@id="42"]/div[1]/div[1]`),
    page.waitForXPath(`//div[@class = 'PopupSearch']/input`),
    page.waitFor(500)
  ])

  // Type in the name of the school
  await wrappedWaitForNetworkIdle(page, [
    textInsertPromise(page, school),

    // Wait for element to show up in list
    page.waitForXPath(`//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`),

    // Wait for page to update
    page.waitFor(750)
  ])
}

// Select school in the school list
const selectSchool = async (page, school) => {
  await switchToMenu(page, 'Kooli nimi')

  // Using double quotes here to escape potential single quotes in the school name
  const xpath = `//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`

  await wrappedWaitForNetworkIdle(page, [
    searchList(page, school),

    page.waitFor(1000)
  ])

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
  await switchToMenu(page, 'Kooli nimi')

  // Using double quotes here to escape potential single quotes in the school name
  const xpath = `//*[@id="42"]/div[2]/div/div[1]/div[@title = "${school}"]`

  if (research) {
    await wrappedWaitForNetworkIdle(page, [
      searchList(page, school)
    ])
  }

  // Unselect the school from the school list
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, xpath),

    // Wait for page to update in addition to having no active requests
    page.waitFor(1000)
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

  if(process.customOptions.verbose) {
	   console.log(`Found classes ${availableClasses.toString()} for ${school}`)
  }
  return availableClasses
}

const selectClass = async (page, classID) => {
  const xpath = `//*[@id="48"]/div[2]/div/div[1]/div/div/div[text() = '${classID}']`

  // Select the class from the list
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, xpath),

    // Wait for page to update in addition to having no active requests
    page.waitFor(1000)
  ])
}

const deselectClass = async (page, classID) => {
  const xpath = `//*[@id="48"]/div[2]/div/div[1]/div/div/div[text() = '${classID}']`

  // Deselect the class from the list
  await wrappedWaitForNetworkIdle(page, [
    simClickXPath(page, xpath),

    // Wait for page to update in addition to having no active requests
    page.waitFor(1000)
  ])
}

const getAvailableSchoolYears = async (page, school, classID) => {
  const xpath = `//*[@id="12"]/div[2]/div[@class = 'QvGrid']/div[1]/div[2]/div/div/div/div[not(@class) and text()]`

  const elements = await page.$x(xpath)
  const schoolYears = elements.map(element => {
    return page.evaluate(el => el.textContent, element)
  })

  if(process.customOptions.verbose) {
    console.log(`Found ${elements.length} school years for class ${classID} in ${school}`)
  }

  return Promise.all(schoolYears)
}

const getStudentsForClass = async (page, school, classID) => {
  // (position() mod 2)=1 is the equivalent of nth-child(odd)
  // https://en.wikibooks.org/wiki/XPath/CSS_Equivalents#:nth-child(odd)_query
  const xpath = `//*[@id="12"]/div[2]/div[@class = 'QvGrid']/div[1]/div[5]/div/div[(position() mod 2)=1]/div/div[not(@class) and text()]`

  const elements = await page.$x(xpath)
  const students = elements.map(element => {
    return page.evaluate(el => el.textContent, element)
  })

  if(process.customOptions.verbose) {
    console.log(`Obtained ${elements.length} years of student data for class ${classID} in ${school}`)
  }

  return Promise.all(students)
}

const getCounty = async (page) => {
  await switchToMenu(page, "Maakond")

  const xpath = `//*[@id="44"]/div[2]/div/div[1]/div[@class = "QvOptional_LED_CHECK_363636"]`
  const elements = await page.$x(xpath)

  return page.evaluate(el => {return el.textContent}, elements[0])
}

const getMunicipality = async (page) => {
  await switchToMenu(page, "Omavalitsus")

  const listXpath = `//*[@id="43"]/div[2]/div`
  const listItemXpath = `//*[@id="43"]/div[2]/div/div[1]/div[@class = "QvOptional_LED_CHECK_363636"]`

  const listTitle = "Omavalitsus"
  await scrollContainer(page, listXpath, {
    direction: 'down',
    delta: 1000,
    scrollCount: 5,
    title: listTitle,
    waitBuffer: 0,
    waitEndDelay: 250
  })

  const elements = await page.$x(listItemXpath)

  return page.evaluate(el => {return el.textContent}, elements[0])
}

// page = frame to take actions in
// school = the name of the school to search in
const loadClassData = async (page, school) => {
  await switchToMenu(page, 'Klass')

  const availableClasses = await getAvailableClasses(page, school)

  let classData = {}

  for (let i = 0; i < availableClasses.length; i++) {
    await selectClass(page, availableClasses[i])

    // Find the available years for the current class
    const years = await getAvailableSchoolYears(page, school, availableClasses[i])

    // Find the number of students per year for this class
    const students = await getStudentsForClass(page, school, availableClasses[i])

    years.forEach((year, index) => {
      classData[availableClasses[i]] = classData[availableClasses[i]] || {}
      classData[availableClasses[i]][year] = students[index]
    })

    await deselectClass(page, availableClasses[i])
  }

  return classData
}

const loadSchoolData = async (page, schools) => {
  try {
    // Killswitch for the school loop
    const upperBound = true ? schools.length : 0

    let schoolData = {}

    for (let i = 0; i < upperBound; i++) {
      if(process.customOptions.verbose) {
        console.log('------------------------------------')
        console.log(schools[i].toUpperCase())
        console.time(`Collecting data for ${schools[i]} took: `)
      }

      await selectSchool(page, schools[i])

      const county = await getCounty(page, schools[i])
      const municipality = await getMunicipality(page, schools[i])
      const classData = await loadClassData(page, schools[i])

      await deselectSchool(page, schools[i])

      const currentTime = new Date()

      let school = {
        name: schools[i],
        classes: classData,
        county: county,
        municipality: municipality,
        lastUpdate: currentTime.toISOString()
      }

      schoolData[school.name] = school

      await saveSchool(school)

      if(process.customOptions.verbose) {
        console.log(school)
        console.timeEnd(`Collecting data for ${schools[i]} took: `)
      }

      await page.waitFor(250)
    }

    return schoolData
  } catch (e) {
    throw e
  }
}

module.exports = loadSchoolData
