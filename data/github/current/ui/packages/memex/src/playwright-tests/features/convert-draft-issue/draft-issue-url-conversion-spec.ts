import {expect, type Page} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustFind, mustNotFind} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {setCellToFocusMode} from '../../helpers/table/interactions'
import {cellTestId} from '../../helpers/table/selectors'
import {testPlatformMeta} from '../../helpers/utils'

const DEFAULT_SIMULATED_LATENCY = 500

test.describe('Convert by setting title to URL', () => {
  test('Updates title to match issue title', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    const cellSelector = _(cellTestId(2, 'Title'))
    const cellTextBeforeEdit = await page.textContent(cellSelector)

    // the draft issue title cell should not have an <a> tag initially
    await mustNotFind(page, `${cellSelector} a`)

    const url = 'https://github.com/github/memex/pull/3158'
    await saveCellText(page, cellSelector, url)

    // wait for the server to respond with the changes to the item type
    await page.waitForSelector(`${cellSelector} a`, {timeout: DEFAULT_SIMULATED_LATENCY * 2})

    const cellTextAfterEdit = await page.textContent(cellSelector)

    // the text of the cell should not be an issue/PR title, i.e. not the initial text or the URL
    expect(cellTextAfterEdit).not.toEqual(cellTextBeforeEdit)
    expect(cellTextAfterEdit).not.toEqual(url)

    // the title cell should be an issue/pr, so we should have a <a> tag
    await mustFind(page, `${cellSelector} a`)
  })

  test('Makes assignees editable', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    const titleCellSelector = _(cellTestId(2, 'Title'))
    const assigneesCellDropdownButtonSelector = `${_(cellTestId(2, 'Assignees'))} button`

    // due to Convert to Issue flow, the Assignees cell will not indicate that it's
    // interactive - this will start the Convert to Issue flow
    await mustFind(page, assigneesCellDropdownButtonSelector)

    const url = 'https://github.com/github/memex/pull/3158'
    await saveCellText(page, titleCellSelector, url)

    // wait for the server to respond with the changes to the item type
    await page.waitForSelector(assigneesCellDropdownButtonSelector, {timeout: DEFAULT_SIMULATED_LATENCY * 2})

    await mustFind(page, assigneesCellDropdownButtonSelector)
  })

  test('Shows toast if server returns error when updating title value', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsInErrorMode')
    const cellSelector = _(cellTestId(2, 'Title'))
    const cellTextBeforeEdit = await page.textContent(cellSelector)

    // the draft issue title cell should not have an <a> tag initially
    await mustNotFind(page, `${cellSelector} a`)

    const url = 'https://github.com/github/memex/pull/3158'
    await saveCellText(page, cellSelector, url)

    // wait for the server to respond with the changes to the item type
    await page.waitForSelector(_('toast'), {timeout: DEFAULT_SIMULATED_LATENCY * 2})

    const cellTextAfterEdit = await page.textContent(cellSelector)

    // the text of the cell should be reverted back to the initial value
    expect(cellTextAfterEdit).toEqual(cellTextBeforeEdit)

    // the draft issue title cell should not have an <a> tag still
    await mustNotFind(page, `${cellSelector} a`)

    // Assert that we displayed an error toast.
    await memex.toasts.expectErrorMessageVisible('Failed to update item')
  })
})

async function clearTextInFocusedInput(page: Page) {
  await page.keyboard.down(testPlatformMeta)
  await page.keyboard.press('A')
  await page.keyboard.up(testPlatformMeta)
  await page.keyboard.press('Backspace')
}

async function saveCellText(page: Page, cellSelector: string, text: string) {
  // put cell into edit mode
  await setCellToFocusMode(page, cellSelector)
  await page.keyboard.press('Enter')

  // clear initial text, enter text, and hit enter to save
  await clearTextInFocusedInput(page)
  await page.keyboard.insertText(text)
  await page.keyboard.press('Enter')
}
