import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

const EDITABLE_COLS = ['Assignees', 'Status', 'Labels', 'Milestone', 'Team', 'Estimate', 'Due Date']
const READONLY_COLS = ['Repository', 'Linked pull requests', 'Tracks', 'Tracked by']

test.describe('clearing table cells with delete key', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewerPrivileges: {viewerRole: 'write'}})
  })

  test('editable values can be deleted', async ({memex, page}) => {
    for (const column of EDITABLE_COLS) {
      const cell = memex.tableView.cells.getCellLocator(1, column)

      await cell.focus()
      await page.keyboard.press('Delete')

      await expect(cell).toBeEmpty()
    }
  })

  test("noneditable values cannot be deleted and don't error", async ({memex, page}) => {
    for (const column of READONLY_COLS) {
      const cell = memex.tableView.cells.getCellLocator(5, column)

      await cell.focus()
      await page.keyboard.press('Delete')

      await expect(cell).not.toBeEmpty()

      await memex.toasts.expectErrorMessageHidden()
    }
  })

  test('title cannot be deleted and shows an error toast', async ({memex, page}) => {
    const cell = memex.tableView.cells.getCellLocator(1, 'Title')

    await cell.focus()
    await page.keyboard.press('Delete')

    await expect(cell).not.toBeEmpty()

    await memex.toasts.expectErrorMessageVisible('Title cannot be deleted')
  })

  test('ranges can be deleted', async ({memex, page}) => {
    for (const column of EDITABLE_COLS) {
      const startCell = memex.tableView.cells.getCellLocator(1, column)
      const midCell = memex.tableView.cells.getCellLocator(2, column)
      const endCell = memex.tableView.cells.getCellLocator(3, column)

      await startCell.dragTo(endCell)
      await page.keyboard.press('Delete')

      await Promise.all([expect(startCell).toBeEmpty(), expect(midCell).toBeEmpty(), expect(endCell).toBeEmpty()])
    }
  })
})
