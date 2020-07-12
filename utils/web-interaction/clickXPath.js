/*
  Finds an xpath on the page and clicks it.
 */
const clickXPath = async (page, xpath, waitOpts) => {
  let waitPromises = []
  let clickPromises = []

  // If wait options are provided, create promises and add them
  // to the "completion required before advancing" array.
  if(waitOpts) {
    if (waitOpts.waitDelay) {
      waitPromises = waitPromises.concat(page.waitFor(waitOpts.waitDelay))
    }

    if (waitOpts.waitXPath) {
      waitPromises = waitPromises.concat(page.waitForXPath(waitOpts.waitXPath))
    }
  }

  // Look for all elements with the provided xpath.
  const elements = await page.$x(xpath)

  // Create a "completion required before advancing" click promise
  // for all returned elements and add them to an array.
  for (let i = 0; i < elements.length; i++) {
    const clickPromise = (async _ => {
      elements[i].click()
      console.log(`Clicked element ${i} with xpath ${xpath}`)
    })()

    clickPromises = clickPromises.concat(clickPromise)
  }

  // Wait for all functions to complete execution.
  Promise.all([
    ...clickPromises,
    ...waitPromises
  ])
}

module.exports = clickXPath
