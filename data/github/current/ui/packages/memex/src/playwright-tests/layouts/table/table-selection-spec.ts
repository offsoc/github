import {expect} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {click} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {expectGroupHasRows, expectGroupIsCollapsed, isGroupedBy, isNotGroupedBy} from '../../helpers/table/assertions'
import {sortByColumnName, toggleGroupBy, toggleGroupCollapsed} from '../../helpers/table/interactions'
import {
  cellTestId,
  getItemRowCountWithinGroup,
  getRow,
  getRows,
  getRowSelectionState,
  getRowSelectionStates,
  getTableIndexForRowInGroup,
  getTableRowWithinGroup,
  rowTestId,
} from '../../helpers/table/selectors'
import {testPlatformMeta} from '../../helpers/utils'

test.describe('navigationAndFocus', () => {
  test.beforeEach(async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await page.getByTestId(cellTestId(0, 'Title')).focus()
  })

  test.describe('Selecting rows', () => {
    test('shift+space selects a row and escape clears selection', async ({page}) => {
      await page.keyboard.press('Shift+ ')

      const [row1] = await getRows(page, [0])
      expect(await getRowSelectionState(row1)).toBe(true)

      await page.keyboard.press('Escape')

      expect(await getRowSelectionState(row1)).toBe(false)
    })

    test('shift+up/down arrow selects rows', async ({page}) => {
      await page.keyboard.press('Shift+ ') // select row 1
      await page.keyboard.press('Shift+ArrowDown') // select row 2
      await page.keyboard.press('Shift+ArrowDown') // select row 3
      await page.keyboard.press('Shift+ArrowUp') // unselect row 3

      const [row1, row2, row3] = await getRows(page, [0, 1, 2])

      const selectionStates = await getRowSelectionStates([row1, row2, row3])
      expect(selectionStates).toEqual([true, true, false])
    })

    test('click on the row dragger select a row', async ({page}) => {
      const row1 = await getRow(page, _(rowTestId(0)))

      await click(row1, _('row-dragger'))
      expect(await getRowSelectionState(row1)).toBe(true)

      await click(row1, _('row-dragger'))
      expect(await getRowSelectionState(row1)).toBe(true)
    })

    test('shift+click on the row dragger select multiple rows', async ({page}) => {
      const [row1, row2, row3, row4] = await getRows(page, [0, 1, 2, 3])

      await click(row1, _('row-dragger'))

      await page.keyboard.down('Shift')

      await click(row3, _('row-dragger'))

      await page.keyboard.up('Shift')

      const selectionStates = await getRowSelectionStates([row1, row2, row3, row4])
      expect(selectionStates).toEqual([true, true, true, false])
    })

    test('for a sorted table shift+click on the row dragger works as expected', async ({page}) => {
      await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortDescending)
      const [row1, row2, row3, row4] = await getRows(page, [5, 4, 3, 2])

      await click(row1, _('row-dragger'))

      await page.keyboard.down('Shift')

      await click(row3, _('row-dragger'))

      await page.keyboard.up('Shift')

      const selectionStates = await getRowSelectionStates([row1, row2, row3, row4])
      expect(selectionStates).toEqual([true, true, true, false])
    })

    test('for a grouped table shift+click on the row dragger across a collapsed group does not select rows in collapsed group', async ({
      page,
    }) => {
      // No Status grouping to begin with.
      await isNotGroupedBy(page, 'Status', 'Done')

      // Turn on Status grouping.
      await toggleGroupBy(page, 'Status')

      // Make sure grouping indicators appear.
      await isGroupedBy(page, 'Status', 'Done')

      // Collapse the Done group.
      await toggleGroupCollapsed(page, 'Done')
      await expectGroupIsCollapsed(page, 'Done')

      // these ids are tied to the expected sort order - the test will select
      // the last row of the backlog group and the first row of the No Status group, ignoring
      // all of the rows in the collapsed Done group
      const backlogRowCount = await getItemRowCountWithinGroup(page, 'Backlog')
      const row1 = await getTableRowWithinGroup(page, 'Backlog', backlogRowCount - 1)
      const row2 = await getTableRowWithinGroup(page, 'No Status', 0)

      await click(row1, _('row-dragger'))

      await page.keyboard.down('Shift')

      await click(row2, _('row-dragger'))

      await page.keyboard.up('Shift')

      // Expand the Done group.
      await toggleGroupCollapsed(page, 'Done')
      await expectGroupHasRows(page, 'Done', 3)

      const row3 = await getTableRowWithinGroup(page, 'Done', 0)

      // The two rows that we clicked on should be selected, but not a row from the done group
      const selectionStates = await getRowSelectionStates([row1, row2, row3])
      expect(selectionStates).toEqual([true, true, false])
    })

    test('meta+click on the row dragger select and toggle multiple rows', async ({page}) => {
      const [row1, row2, row3, row4] = await getRows(page, [0, 1, 2, 3])

      await click(row1, _('row-dragger'))

      await page.keyboard.down(testPlatformMeta)

      await click(row3, _('row-dragger'))

      await page.keyboard.up(testPlatformMeta)

      const selectionStates1 = await getRowSelectionStates([row1, row2, row3, row4])
      expect(selectionStates1).toEqual([true, false, true, false])

      await page.keyboard.down(testPlatformMeta)

      await click(row3, _('row-dragger'))

      await page.keyboard.up(testPlatformMeta)

      const selectionStates2 = await getRowSelectionStates([row1, row2, row3, row4])
      expect(selectionStates2).toEqual([true, false, false, false])
    })
  })

  test.describe('Selecting cells', () => {
    const allRowIndexes = [0, 1, 2, 3, 4, 5, 6, 7] as const

    test('selects entire column with "Select column" action', async ({page, memex}) => {
      await page.getByRole('button', {name: 'Title column options'}).click()
      await page.getByRole('menuitem', {name: 'Select column'}).click()

      await Promise.all(
        allRowIndexes.map(index =>
          expect(memex.tableView.cells.getCellLocator(index, 'Title')).toHaveClass(/is-selected/),
        ),
      )

      await expect(memex.tableView.cells.getCellLocator(0, 'Title')).toHaveClass(/is-focused/)
    })

    test('skips cells in collapsed groups', async ({page, memex}) => {
      await page.getByRole('button', {name: 'Stage column options'}).click()
      await page.getByRole('menuitem', {name: 'Group by values'}).click()

      await page.getByRole('button', {name: 'Collapse group Up Next'}).click()

      await page.getByRole('button', {name: 'Status column options'}).click()

      await page.getByRole('menuitem', {name: 'Select column'}).click()
      const indexForClosedRow = await getTableIndexForRowInGroup(page, 'Closed', 0)
      await expect(memex.tableView.cells.getCellLocator(indexForClosedRow, 'Status')).toHaveClass(/is-focused/)

      await page.keyboard.press('Delete')

      await page.getByRole('button', {name: 'Expand group Up Next'}).click()

      const indexForUpNextRow = await getTableIndexForRowInGroup(page, 'Up Next', 0)
      await expect(memex.tableView.cells.getCellLocator(indexForUpNextRow, 'Status')).toHaveText('Backlog')
      await expect(memex.tableView.cells.getCellLocator(indexForClosedRow, 'Status')).toBeEmpty()
    })

    test('selects multiple cells with ctrl+click', async ({memex}) => {
      const one = memex.tableView.cells.getCellLocator(0, 'Status')
      const two = memex.tableView.cells.getCellLocator(1, 'Status')

      await one.click()
      await two.click({modifiers: ['Control']})

      await expect(one).toHaveClass(/is-selected/)
      await expect(two).toHaveClass(/is-selected/)
      await expect(two).toHaveClass(/is-focused/)
    })

    test('selects multiple non-bulk-editable cells with ctrl+click', async ({memex}) => {
      const one = memex.tableView.cells.getCellLocator(1, 'Title')
      const two = memex.tableView.cells.getCellLocator(2, 'Title')

      await one.click()
      await two.click({modifiers: ['Control']})

      await expect(one).toHaveClass(/is-selected/)
      await expect(two).toHaveClass(/is-selected/)
      await expect(two).toHaveClass(/is-focused/)
    })
  })
})
