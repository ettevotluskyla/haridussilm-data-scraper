// Find a link in the left navigation tab by the text content
const findByDiv = async (page, linkString) => {
  const links = await page.$x('//*[@id="9"]/div[2]/div[1]/div')

  console.log(`Looking for div with content "${linkString}"...`)

  for (let i = 0; i < links.length; i++) {
    const textContent = await page.evaluate(link => link.textContent, links[i])

    if (textContent == linkString) {
      console.log(`Match found // textContent: ${textContent} / linkString: ${linkString}`);
      return links[i]
    }
  }

  // If no match found, return null
  return null
}

/*
  Finds a div with the following text and clicks it.
  After clicking waits for the right tab to be updated.
 */
const clickByText = async (page, text) => {
  const el = await findByDiv(page, text)
  //console.log('el ', el)

  await Promise.all([
    page.waitForXPath('//*[@id="9"]/div[2]/div[1]/div[1]'),
    el.click()
  ])
}

const scrollContainer = async page => {
  // Wait for the QVListContainer to show up before assigning to a variable
  await Promise.all([
    page.waitForXPath('//*[@id="42"]/div[2]/div')
  ])

  // QVListContainer with event listener for 'mousewheel'
  const schoolList = await page.$x('//*[@id="42"]/div[2]/div')

  await page.evaluate(async el => {
    const cEvent = new Event('mousewheel')
    cEvent.wheelDelta = -1000

    await el.dispatchEvent(cEvent)

  }, schoolList[0])
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
    clickByText(page, 'Kooli nimi'),
    page.evaluate(el => el.textContent == 'Kooli nimi', await page.$x('//*[@id="42"]/div[1]/div[2]/div/div'))
  ])

  console.log('Scrolling school list container to the bottom...')
  for (let i = 0; i < 35; i++) {
    await scrollContainer(page)
    await page.waitFor(500)
  }

  console.log('Loading names of all schools...')
  const schoolNames = await getSchoolNames(page)
  console.log(`Loaded names of ${schoolNames.length} schools`)

  return schoolNames
}

module.exports = loadSchoolNameList
