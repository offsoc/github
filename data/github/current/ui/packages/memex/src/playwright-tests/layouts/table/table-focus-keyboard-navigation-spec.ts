import {expect} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {mustFind} from '../../helpers/dom/assertions'
import {hasDOMFocus} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {isGroupedBy} from '../../helpers/table/assertions'
import {setCellToFocusMode as clickCell, sortByColumnName, toggleGroupBy} from '../../helpers/table/interactions'
import {
  cellTestId,
  getCellMode,
  getItemRowCountWithinGroup,
  getLastColumnOfTable,
  getLastRowIndexOfTable,
  getRowCountInTable,
  getTableCellText,
  getTableIndexForRowInGroup,
  getTableRow,
} from '../../helpers/table/selectors'
import {generateRandomName, testPlatformMeta} from '../../helpers/utils'
import {CellMode} from '../../types/table'

test.describe('Focus management when navigating table with keyboard', () => {
  test.describe('New item row', () => {
    let lastRowIndex = 0
    let lastColumnName = ''

    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      lastColumnName = await getLastColumnOfTable(page)
      lastRowIndex = await getLastRowIndexOfTable(page)
    })

    test('Pressing Meta+ArrowDown from the new item row focuses on the last data row', async ({page, memex}) => {
      await memex.omnibar.INPUT.focus()
      await page.keyboard.press(`${testPlatformMeta}+ArrowDown`)
      const finalTitleSelector = _(cellTestId(lastRowIndex, 'Title'))
      expect(await getCellMode(page, finalTitleSelector)).toBe(CellMode.FOCUSED)
    })

    test('Pressing Meta+ArrowUp from the new item row focuses on the first data row', async ({page, memex}) => {
      await memex.omnibar.INPUT.focus()
      await page.keyboard.press(`${testPlatformMeta}+ArrowUp`)
      const firstTitleSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, firstTitleSelector)).toBe(CellMode.FOCUSED)
    })

    test("Pressing Meta+End from the new item row focuses on the last data row's last column", async ({
      page,
      memex,
    }) => {
      await memex.omnibar.INPUT.focus()
      await page.keyboard.press(`${testPlatformMeta}+End`)
      const finalCellSelector = _(cellTestId(lastRowIndex, lastColumnName))
      expect(await getCellMode(page, finalCellSelector)).toBe(CellMode.FOCUSED)
    })

    test('Down and up arrows should navigate into omnibar and adjacent group, preserving the previous column focus', async ({
      page,
    }) => {
      await toggleGroupBy(page, 'Status')
      await isGroupedBy(page, 'Status', 'Backlog')
      const rowCount = await getItemRowCountWithinGroup(page, 'Backlog')

      const lastRowInGroupTestId = await getTableIndexForRowInGroup(page, 'Backlog', rowCount - 1)
      const startingCellSelector = _(cellTestId(lastRowInGroupTestId, 'Assignees'))

      await clickCell(page, startingCellSelector)
      expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')
      const backlogSection = await mustFind(page, _('table-group-footer-Backlog'))
      const backlogOmnibar = await mustFind(backlogSection, _('repo-searcher-input'))
      expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
      expect(await hasDOMFocus(page, backlogOmnibar)).toBe(true)

      await page.keyboard.press('ArrowDown')

      const firstRowIndexDoneGroup = await getTableIndexForRowInGroup(page, 'Done', 0)
      const firstRowDoneGroup = _(cellTestId(firstRowIndexDoneGroup, 'Assignees'))
      const secondRowIndexDoneGroup = await getTableIndexForRowInGroup(page, 'Done', 1)
      const secondRowDoneGroup = _(cellTestId(secondRowIndexDoneGroup, 'Assignees'))
      const thirdRowIndexDoneGroup = await getTableIndexForRowInGroup(page, 'Done', 2)
      const thirdRowDoneGroup = _(cellTestId(thirdRowIndexDoneGroup, 'Assignees'))

      expect(await getCellMode(page, firstRowDoneGroup)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')

      expect(await getCellMode(page, secondRowDoneGroup)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')

      expect(await getCellMode(page, thirdRowDoneGroup)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')

      const readySection = await mustFind(page, _('table-group-footer-Done'))
      const readyOmnibar = await mustFind(readySection, _('repo-searcher-input'))
      expect(await hasDOMFocus(page, readyOmnibar)).toBe(true)

      await page.keyboard.press('ArrowUp')

      expect(await getCellMode(page, thirdRowDoneGroup)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowUp')

      expect(await getCellMode(page, secondRowDoneGroup)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowUp')

      expect(await getCellMode(page, firstRowDoneGroup)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowUp')
      expect(await hasDOMFocus(page, backlogOmnibar)).toBe(true)

      await page.keyboard.press('ArrowUp')
      expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.FOCUSED)
    })

    test('Down and up arrows should navigate into omnibar and adjacent group (sorted descending), preserving the previous column focus', async ({
      page,
    }) => {
      await toggleGroupBy(page, 'Status')
      await isGroupedBy(page, 'Status', 'Backlog')
      await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortDescending)

      const rowCount = await getItemRowCountWithinGroup(page, 'No Status')
      const lastRowInGroupTestId = await getTableIndexForRowInGroup(page, 'No Status', rowCount - 1)
      const startingCellSelector = _(cellTestId(lastRowInGroupTestId, 'Assignees'))

      await clickCell(page, startingCellSelector)
      expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')
      const noStatusSection = await mustFind(page, _('table-group-footer-No Status'))
      const noStatusOmnibar = await mustFind(noStatusSection, _('repo-searcher-input'))
      expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
      expect(await hasDOMFocus(page, noStatusOmnibar)).toBe(true)

      await page.keyboard.press('ArrowDown')
      const firstRowIndexDoneSection = await getTableIndexForRowInGroup(page, 'Done', 0)
      const doneSectionFirstRowSameColumn = await mustFind(page, _(cellTestId(firstRowIndexDoneSection, 'Assignees')))
      expect(await hasDOMFocus(page, doneSectionFirstRowSameColumn)).toBe(true)

      await page.keyboard.press('ArrowUp')
      expect(await hasDOMFocus(page, noStatusOmnibar)).toBe(true)

      await page.keyboard.press('ArrowUp')
      expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.FOCUSED)
    })

    test('Navigating to the right with Tab should ignore the non-navigable add row column', async ({page}) => {
      const cellSelector = _(cellTestId(3, lastColumnName))
      const addRowSelector = _(cellTestId(3, 'add-column'))

      await clickCell(page, cellSelector)
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

      await page.keyboard.press('Tab')

      expect(await getCellMode(page, addRowSelector)).toBe(CellMode.DEFAULT)
    })

    test('pressing Tab adds the item to the table and focuses second column', async ({page, memex}) => {
      const initialCount = await getRowCountInTable(page)
      await page.keyboard.press('Control+Space')
      await expect(memex.omnibar.INPUT).toBeFocused()
      const itemName = `Draft issue ${generateRandomName()}`
      await page.keyboard.insertText(itemName)

      await page.keyboard.press('Tab')
      await page.waitForSelector(`text=${itemName}`)

      const afterCount = await getRowCountInTable(page)
      expect(afterCount).toEqual(initialCount + 1)

      const lastRow = await getTableRow(page, afterCount)
      const titleCellText = await getTableCellText(lastRow, 1)

      expect(titleCellText).toEqual(itemName)
      expect(await getCellMode(page, _(cellTestId(8, 'Assignees')))).toBe(CellMode.FOCUSED)
    })
  })

  test.describe('Focus management when navigating table with keyboard for an empty memex', () => {
    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await page.getByRole('button', {name: 'Close'}).click()
      await page.keyboard.press('Escape') // dismiss the suggester
    })

    test('Pressing up from the new item row should focus on search input when search is visible', async ({
      page,
      memex,
    }) => {
      await memex.filter.toggleFilter()
      await memex.omnibar.INPUT.focus()
      await expect(memex.omnibar.INPUT).toBeFocused()

      await page.keyboard.press('ArrowUp')

      await expect(memex.filter.INPUT).toBeFocused()
    })
  })
})
