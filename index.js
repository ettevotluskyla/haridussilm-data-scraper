const puppeteer = require('puppeteer')
const loadSchoolList = require('./actions/loadSchoolList')

const hsUrl = 'https://haridussilm.ee/?leht=alus_yld_2'

const main = async () => {
  const browser = await puppeteer.launch({ 'headless': false })
  const page = await browser.newPage()
  await page.goto(hsUrl, { waitUntil: 'networkidle0' })

  // Load iframe on page
  const frameHandle = await page.$('.i_frame')
  const frame = await frameHandle.contentFrame()

  const schools = await loadSchoolList(frame)

  // await browser.close()
}
main()
