// Clicks in the middle of the provided element using the mouse
const simClickXPath = async (page, xpath) => {
  if(process.customOptions.verbose) {
    console.log(`Simulating click on element with xpath: ${xpath}`)
  }
  
  await page.waitForXPath(xpath)
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

module.exports = simClickXPath
