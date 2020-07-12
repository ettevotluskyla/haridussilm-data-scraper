// Sends simulated scroll events to all elements with the provided xpath.
const scrollContainer = async (page, elementXPath, opts) => {
  // Wait for the QvListContainer to show up before assigning to a variable
  await page.waitForXPath(elementXPath)

  const options = {
    dirStr: opts.direction || 'down',
    delta: opts.delta || 1000,
    scrollCount: opts.scrollCount || 0,
    title: opts.title,
    waitOpts: {
      waitBuffer: opts.waitBuffer || 0,
      waitEndDelay: opts.waitEndDelay,
      waitEndXPath: opts.waitEndXpath,
    }
  }

  // QvListContainer with event listener for 'mousewheel'
  const schoolListArray = await page.$x(elementXPath)

  // In case title is undefined, exclude it from the logs.
  const logTitle = options.title ? `'${options.title}' ` : ''
  console.log(`Started scrolling ${logTitle}container${(schoolListArray.length > 1) ? '(s)' : ''}.`)

  // The scroll event's direction is determined by the pos/neg direction
  // of the provided delta, so the direction string is mapped
  // to the according pos/neg multiplier.
  const multipliers = {
    up: 1,
    down: -1
  }

  // Pos/neg multiplier returned from the direction map.
  const direction = multipliers[options.dirStr]
  const delta = options.delta

  // Loops through all elements with the provided xpath
  // and dispatches a custom scroll event for the given amount of times.
  for (let i = 0; i < schoolListArray.length; i++) {
    const schoolList = schoolListArray[i]

    // Default scroll count is 0, so if no scroll count is provided,
    // then no scrolling takes place.
    for (var j = 0; j < options.scrollCount; j++) {
      const scrollPromise = page.evaluate(async (el, delta, direction) => {
        const scrollEvent = new Event('mousewheel')

        scrollEvent.wheelDelta = delta * direction

        await el.dispatchEvent(scrollEvent)


      }, schoolList, delta, direction)

      await Promise.all([
        scrollPromise,
        page.waitFor(options.waitOpts.waitBuffer)
      ])
    }

    if (schoolListArray.length > 1) {
      await page.waitFor(250)
    }
  }

  // Wait after all scrolling is complete if the relevant are provided.
  let waitPromises = []

  if (options.waitOpts.waitEndDelay) {
    waitPromises = waitPromises.concat(page.waitForXPath(options.waitOpts.waitEndDelay))
  }

  if (options.waitOpts.waitEndXPath) {
    waitPromises = waitPromises.concat(page.waitForXPath(options.waitOpts.waitEndXPath))
  }

  Promise.all([
    ...waitPromises
  ])

  console.log(`Finished scrolling ${logTitle}container${(schoolListArray.length > 1) ? '(s)' : ''}.`)
}

module.exports = scrollContainer
