import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustNotFind} from '../../helpers/dom/assertions'
import {submitConfirmDialog} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {
  cellTestId,
  getCellMode,
  getRowCountInTable,
  getRows,
  getRowSelectionState,
  getRowSelectionStates,
  getTableDataRows,
  getTableRow,
} from '../../helpers/table/selectors'
import {CellMode} from '../../types/table'

test.describe('Table view', () => {
  test.describe('Delete rows', () => {
    test.beforeEach(async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithItems')
      await page.getByTestId(cellTestId(0, 'Title')).focus()
    })

    test('delete remove the row using delete key and focus the next first row', async ({page}) => {
      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row

      const [row1] = await getRows(page, [0])

      await page.keyboard.press('Delete')

      await submitConfirmDialog(page, 'Delete')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 1)
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('delete remove the row using row menu and focus the next first row', async ({page}) => {
      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row

      const [row1] = await getRows(page, [0])

      // eslint-disable-next-line no-restricted-syntax
      const menuTrigger = await row1.$(_('row-menu-trigger'))
      await menuTrigger.click()

      const deleteOption = page.getByTestId('row-menu-delete')
      await deleteOption.click()

      await submitConfirmDialog(page, 'Delete')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 1)
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('confirming a row deletion gives focus to the cell', async ({page}) => {
      await page.keyboard.press('Shift+ ') // select first row

      const [row1] = await getRows(page, [0])
      expect(await getRowSelectionState(row1)).toBe(true)

      await page.keyboard.press('Delete')

      await submitConfirmDialog(page, 'Delete')

      const [newRow1] = await getRows(page, [0])
      expect(await getRowSelectionState(newRow1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('canceling a row deletion returns focus to the cell and preserves selection', async ({page}) => {
      await page.keyboard.press('Shift+ ') // select first row

      const [row1] = await getRows(page, [0])

      expect(await getRowSelectionState(row1)).toBe(true)

      await page.keyboard.press('Delete')

      await submitConfirmDialog(page, 'Cancel')

      expect(await getRowSelectionState(row1)).toBe(true)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('delete multiple rows using row menu', async ({page}) => {
      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row
      await page.keyboard.press('Shift+ArrowDown') // select row 2
      await page.keyboard.press('Shift+ArrowDown') // select row 3

      const [row1] = await getRows(page, [0])

      // eslint-disable-next-line no-restricted-syntax
      const menuTrigger = await row1.$(_('row-menu-trigger'))
      await menuTrigger.click()

      const deleteOption = page.getByTestId('row-menu-delete-multiple')
      await deleteOption.click()

      await submitConfirmDialog(page, 'Delete')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 3)
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('delete multiple rows using delete key', async ({page}) => {
      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row
      await page.keyboard.press('Shift+ArrowDown') // select row 2
      await page.keyboard.press('Shift+ArrowDown') // select row 3

      const [row1] = await getRows(page, [0])

      await page.keyboard.press('Delete')

      await submitConfirmDialog(page, 'Delete')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 3)
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('add new rows after deleting multiple rows', async ({page}) => {
      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row
      await page.keyboard.press('Shift+ArrowDown') // select row 2
      await page.keyboard.press('Shift+ArrowDown') // select row 3

      await page.keyboard.press('Delete')

      await submitConfirmDialog(page, 'Delete')

      const plusButton = await page.waitForSelector(_('new-item-button'))
      await plusButton.click()

      await page.keyboard.insertText('apple')
      await page.keyboard.press('Enter')
      await page.waitForSelector('text=apple')

      await page.keyboard.insertText('cherry')
      await page.keyboard.press('Enter')
      await page.waitForSelector('text=cherry')

      await page.keyboard.insertText('banana')
      await page.keyboard.press('Enter')
      await page.waitForSelector('text=banana')

      const rows = await getTableDataRows(page)
      const selectionStates = await getRowSelectionStates(rows)

      // verify that no rows are selected
      expect(selectionStates).toEqual(new Array(initialCount).fill(false))
    })
  })

  test.describe('Archive - Table View', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')
    })

    test('archive an item from the row context menu', async ({page}) => {
      const initialCount = await getRowCountInTable(page)

      const [row1] = await getRows(page, [0])

      // eslint-disable-next-line no-restricted-syntax
      const cell = await row1.$(_('row-menu-trigger'))
      await cell.click()

      const archiveOption = page.getByTestId('row-menu-archive')
      await archiveOption.click()

      await submitConfirmDialog(page, 'Archive')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 1)
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)
    })

    test('Archive is an option in the context menu for a draft issue', async ({page}) => {
      const DRAFT_ISSUE_ROW_INDEX = 3

      const draftIssue = await getTableRow(page, DRAFT_ISSUE_ROW_INDEX)
      const menuTrigger = draftIssue.getByTestId('row-menu-trigger')
      await menuTrigger.click()

      const archiveOption = page.getByTestId('row-menu-archive')
      await expect(archiveOption).toBeVisible()
    })

    test('context menu does not exist for redacted items', async ({page}) => {
      const REDACTED_ITEM_ROW_INDEX = 5
      const redactedItem = await getTableRow(page, REDACTED_ITEM_ROW_INDEX)

      await mustNotFind(redactedItem, 'row-menu-trigger')
    })

    test('keyboard shortcut prevents action for a draft issue', async ({page}) => {
      const DRAFT_ISSUE_ROW_INDEX = 3

      await getTableRow(page, DRAFT_ISSUE_ROW_INDEX)
      await page.keyboard.press('e')

      await expect(page.getByRole('alertdialog')).toBeHidden()
    })

    test('keyboard shortcut prevents action for a redacted item', async ({page}) => {
      const REDACTED_ITEM_CARD_INDEX = 5

      await getTableRow(page, REDACTED_ITEM_CARD_INDEX)
      await page.keyboard.press('e')

      await expect(page.getByRole('alertdialog')).toBeHidden()
    })

    test('archives the row and focus the next row', async ({page, memex}) => {
      await memex.tableView.cells.getCellLocator(0, 'Title').focus()

      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row

      const [row1] = await getRows(page, [0])

      await page.keyboard.press('e')

      await submitConfirmDialog(page, 'Archive')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 1)
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))

      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('cancelling an archive action returns focus to the cell', async ({page, memex}) => {
      await memex.tableView.cells.getCellLocator(0, 'Title').focus()

      await page.keyboard.press('Shift+ ') // select first row

      await getRows(page, [0])

      await page.keyboard.press('e')

      await submitConfirmDialog(page, 'Cancel')

      const cellSelector = _(cellTestId(0, 'Title'))

      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('archives multiple rows using E key', async ({memex, page}) => {
      await memex.tableView.cells.getCellLocator(0, 'Title').focus()

      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row
      await page.keyboard.press('Shift+ArrowDown') // select row 2

      const [row1] = await getRows(page, [0])

      await page.keyboard.press('e')

      await submitConfirmDialog(page, 'Archive')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 2) // cannot archive redacted items
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    // https://github.com/github/memex/issues/9304
    test.fixme('archives multiple rows using row menu', async ({page, memex}) => {
      await memex.tableView.cells.getCellLocator(0, 'Title').focus()
      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row
      await page.keyboard.press('Shift+ArrowDown') // select row 2

      const [row1] = await getRows(page, [0])

      // eslint-disable-next-line no-restricted-syntax
      const menu = await row1.$(_('row-menu-trigger'))
      await menu.click()

      const archiveOption = page.getByTestId('row-menu-archive-multiple')
      await archiveOption.click()

      await submitConfirmDialog(page, 'Archive')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 2) // cannot archive redacted items
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('archive multiple rows including draft issues', async ({page, memex}) => {
      await memex.tableView.cells.getCellLocator(0, 'Title').focus()

      const initialCount = await getRowCountInTable(page)

      await page.keyboard.press('Shift+ ') // select first row
      await page.keyboard.press('Shift+ArrowDown') // select row 2
      await page.keyboard.press('Shift+ArrowDown') // select row 3

      const [row1] = await getRows(page, [0])

      await page.keyboard.press('e')
      await submitConfirmDialog(page, 'Archive')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 3)
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('archive multiple rows except redacted items', async ({page}) => {
      const initialCount = await getRowCountInTable(page)

      const issueSelector = _(cellTestId(3, 'Title'))
      const cell = page.locator(issueSelector)
      await cell.click()

      await page.keyboard.press('Shift+ ') // select first row
      await page.keyboard.press('Shift+ArrowDown') // select row 2
      await page.keyboard.press('Shift+ArrowDown') // select row 3

      const [row1] = await getRows(page, [0])

      await page.keyboard.press('e')

      await submitConfirmDialog(page, 'Archive')

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toBe(initialCount - 2) // cannot archive redacted items
      const rows = await getTableDataRows(page)
      expect(rows.includes(row1)).toBe(false)

      const cellSelector = _(cellTestId(3, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })
  })

  test.describe('In error mode', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsInErrorMode')
    })

    test.describe('Delete rows', () => {
      test('displays an error toast if deletion fails', async ({page, memex}) => {
        const row1 = memex.tableView.rows.getRow(1)
        await row1.CONTEXT_MENU.TRIGGER.click()
        await row1.CONTEXT_MENU.ACTION_DELETE.click()

        await submitConfirmDialog(page, 'Delete')
        await memex.toasts.expectErrorMessageVisible('Failed to delete item(s)')
      })
    })
  })
})
