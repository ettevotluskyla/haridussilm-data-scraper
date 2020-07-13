const switchToMenu = require('../../utils/web-interaction/switchToMenu')
const loadClassData = require('../haridussilm/loadClassData')

const runShard = async shard => {
  const { page, schools } = shard

  await page.goto(hsUrl, { waitUntil: 'networkidle0' })
  await switchToMenu(page, 'Kooli nimi')

  await page.waitFor(250)

  const schoolData = await loadClassData(page, schools)

  await page.waitFor(1000)

  await page.close()
}
