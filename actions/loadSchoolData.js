const schoolYears = ['05/06', '06/07', '07/08', '08/09', '09/10', '10/11',
                     '11/12', '12/13', '13/14', '14/15', '15/16', '16/17',
                     '17/18', '18/19', '19/20']

// Normalizing the text
const getText = async (linkText) => {
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

/*
  Finds a div with the following text and clicks it.
  After clicking waits for the right tab to be updated.
 */
const clickByText = async (frame, text) => {
  const el = await findByDiv(frame, text)

  await Promise.all([
    frame.waitForXPath('//*[@id="42"]/div[1]/div[2]/div/div[contains(text(),"Kooli nimi")]'),
    el.click(),
  ])
}

// frame = iframe to take actions in
// school = the name of the school to search in
const loadSchoolYearInfo = async (frame, school) => {

}

const loadSchoolData = async (frame, schools) => {
  await schools.forEach(async school => {
    await loadSchoolYearInfo(frame, school)
  })
}
