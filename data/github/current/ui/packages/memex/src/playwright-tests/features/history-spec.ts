import {expect, type Page} from '@playwright/test'

import {test} from '../fixtures/test-extended'

const undo = (page: Page) => page.keyboard.press('Control+z')

test.describe('History', () => {
  test('can undo via keyboard', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const cell = memex.tableView.cells.getCellLocator(1, 'Estimate')
    await expect(cell).toHaveText('10')

    await cell.click()
    await page.keyboard.press('Delete')
    await expect(cell).toBeEmpty()

    // Unfortunately there's no other way to ensure the action has been placed on the undo stack, because it doesn't
    // happen synchronously and it doesn't cause a UI change
    await page.waitForTimeout(1000)
    await undo(page)

    await expect(cell).toHaveText('10')
  })

  test('multiple actions can be undone', async ({memex, page, clipboard}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const firstCell = memex.tableView.cells.getCellLocator(0, 'Estimate')
    const secondCell = memex.tableView.cells.getCellLocator(1, 'Estimate')
    const copySourceCell = memex.tableView.cells.getCellLocator(3, 'Estimate')

    await Promise.all([expect(firstCell).toHaveText('10'), expect(secondCell).toHaveText('10')])

    // We can't just delete the values from both cells because we need the undo button label text to change in order
    // be able to accurately wait for the undo action to get registered on to the stack. The easy way would be to delete
    // one cell and then type in the other, but typing in a cell registers two undo events in dev environments
    // (https://github.com/github/memex/issues/15684) so we use a copy/paste instead.

    await firstCell.click()
    await page.keyboard.press('Delete')

    await copySourceCell.click()
    await clipboard.copySelection()
    await secondCell.click()
    await clipboard.paste()

    await Promise.all([expect(firstCell).toBeEmpty(), expect(secondCell).toHaveText('3')])

    await page.waitForTimeout(1000)
    await undo(page)

    await Promise.all([expect(firstCell).toBeEmpty(), expect(secondCell).toHaveText('10')])

    await undo(page)

    await Promise.all([expect(firstCell).toHaveText('10'), expect(secondCell).toHaveText('10')])
  })
})
