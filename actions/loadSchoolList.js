// Normalizing the text
function getText(linkText) {
  linkText = linkText.replace(/\r\n|\r/g, "\n");
  linkText = linkText.replace(/\ +/g, " ");

  // Replace &nbsp; with a space
  var nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, " ");
}

// find the link, by going over all links on the page
async function findByDiv(frame, linkString) {
  const links = await frame.$$('.QvTabLeft')
  for (var i=0; i < links.length; i++) {
    let valueHandle = await links[i].getProperty('innerText');
    let linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    if (linkString == text) {
      //console.log(linkString);
      //console.log(text);
      console.log("Found");
      return links[i];
    }
  }
  return null;
}

const clickByText = async (frame, text) => {
  const el = await findByDiv(frame, text)

  await Promise.all([
    frame.waitForXPath('//*[@id="42"]/div[1]/div[2]/div/div[contains(text(),"Kooli nimi")]'),
    el.click(),
  ])
}

const scrollContainer = async frame => {
  const schoolList = await frame.$x('//*[@id="42"]/div[2]/div')

  await frame.evaluate(async el => {
    const cEvent = new Event('mousewheel');
    cEvent.wheelDelta = -1000

    await el.dispatchEvent(cEvent);

  }, schoolList[0])
}

const getSchools = async frame => {
  const schoolsElements = await frame.$x('//*[@id="42"]/div[2]/div/div[1]/div')

  const schools =

  await schoolsElements.map(async element => {
    const title = await frame.evaluate(el => {
      return el.getAttribute('title')
    }, element)

    return title
  })

  return Promise.all(schools)
}

const loadSchoolList = async frame => {
  await clickByText(frame, 'Kooli nimi')

  for (let i = 0; i < 35; i++) {
    await scrollContainer(frame)
    await frame.waitFor(500)
  }

  const schools = await getSchools(frame)

  schools.forEach(school => console.log(school))


  return schools
}

module.exports = loadSchoolList
