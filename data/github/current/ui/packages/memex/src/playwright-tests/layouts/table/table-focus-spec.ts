import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'
import {setCellToEditMode as dblClickCell, setCellToFocusMode as clickCell} from '../../helpers/table/interactions'
import {cellTestId, getCellMode, getTableDataRows, getTableRowIndex} from '../../helpers/table/selectors'
import {CellMode} from '../../types/table'

test.describe('navigationAndFocus', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test.describe('Initial focus', () => {
    const firstCell = _(cellTestId(0, 'Title'))

    test('Nothing is focused when the page loads', async ({page}) => {
      await expect(page.locator('body')).toBeFocused()
    })

    test('Can jump focus with down arrow after page load', async ({page}) => {
      await page.keyboard.press('ArrowDown')
      expect(await getCellMode(page, firstCell)).toBe(CellMode.FOCUSED)
    })

    test('Can jump focus with down arrow when tab is focused', async ({page, memex}) => {
      await memex.views.ACTIVE_TAB.focus()
      await page.keyboard.press('ArrowDown')
      expect(await getCellMode(page, firstCell)).toBe(CellMode.FOCUSED)
    })

    test('Cannot jump focus when anything else is focused', async ({page, memex}) => {
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.focus()
      await page.keyboard.press('ArrowDown')
      expect(await getCellMode(page, firstCell)).toBe(CellMode.DEFAULT)
    })
  })

  test.describe('Entering edit mode', () => {
    test.describe('Redacted rows', () => {
      let redactedIndex: number = undefined

      test.beforeEach(async ({page}) => {
        redactedIndex = undefined

        const rows = await getTableDataRows(page)
        for (const row of rows) {
          const index = await getTableRowIndex(row)
          // eslint-disable-next-line no-restricted-syntax
          const titleCell = await row.$(_(cellTestId(index, 'Title')))

          // first check - redacted rows has not allowed cursors in the UI
          const classValue = await titleCell.getAttribute('class')
          if (classValue.indexOf('cursor-not-allowed') === -1) {
            continue
          }

          // we expect to see a set message in the title cell for this row
          const text = await titleCell.textContent()
          if (text === "You don't have permission to access this item") {
            redactedIndex = index
            break
          }
        }

        if (!redactedIndex) {
          test.fail(true, 'Fixtures are missing a redacted row')
        }
      })

      test('Clicking a focused cell puts it in edit mode', async ({page}) => {
        const cellSelector = _(cellTestId(redactedIndex, 'Title'))

        expect(await getCellMode(page, cellSelector)).toBe(CellMode.DEFAULT)

        await clickCell(page, cellSelector)
        expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

        await clickCell(page, cellSelector)
        expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
      })

      test('Pressing Enter on a focused cell puts it into edit mode', async ({page}) => {
        const cellSelector = _(cellTestId(redactedIndex, 'Title'))

        await clickCell(page, cellSelector)
        expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

        await page.keyboard.press('Enter')

        expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
      })

      test('Double clicking a cell in default mode puts it into edit mode', async ({page}) => {
        const cellSelector = _(cellTestId(redactedIndex, 'Title'))

        expect(await getCellMode(page, cellSelector)).toBe(CellMode.DEFAULT)

        await dblClickCell(page, cellSelector)

        expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
      })
    })
  })
})
