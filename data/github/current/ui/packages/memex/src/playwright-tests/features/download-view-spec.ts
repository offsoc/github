import {expect} from '@playwright/test'
import type {Readable} from 'stream'

import {test} from '../fixtures/test-extended'
import {integrationTestsWithItemsTsv} from '../snapshots/integration-tests-with-items-tsv'

async function readStreamAsString(stream: Readable) {
  let result = ''
  for await (const chunk of stream) result += `${chunk}`
  stream.destroy()
  return result
}

test('downloads view as TSV', async ({memex, page}) => {
  await memex.navigateToStory('integrationTestsWithItems')

  await memex.viewOptionsMenu.open()
  const downloadPromise = page.waitForEvent('download')
  await page.keyboard.press('ArrowUp')
  await expect(memex.viewOptionsMenu.EXPORT_VIEW_DATA).toBeFocused()
  await page.keyboard.press('Enter')
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe("My Team's Memex - View 1.tsv")

  const stream = await download.createReadStream()
  const content = await readStreamAsString(stream)

  expect(content).toBe(integrationTestsWithItemsTsv)
})
