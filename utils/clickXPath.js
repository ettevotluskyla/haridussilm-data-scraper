/*
  Finds an xpath on the page and clicks it.
 */
const clickXPath = async (page, xpath) => {
  console.log(`Clicking first element with xpath ${xpath}`)

  const elements = await page.$x(xpath)
  await elements[0].click()
}

module.exports = clickXPath
