// Find a link in the left navigation tab by the text content
const findByTextContent = async (page, elXPath, searchString) => {
  // Left navigation tab element containing links
  const links = await page.$x(elXPath)

  if(process.customOptions.verbose) {
    console.log(`Looking for div with content "${searchString}"...`)
  }

  for (let i = 0; i < links.length; i++) {
    const textContent = await page.evaluate(link => link.textContent, links[i])

    if (textContent == searchString) {
      if(process.customOptions.verbose) {
        console.log(`Match found // textContent: ${textContent} / linkString: ${searchString}`)
      }
      return links[i]
    }
  }

  // If no match found, return null
  return null
}

module.exports = findByTextContent
