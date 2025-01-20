import {expect} from '@playwright/test'

import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'
import {mustFind} from '../../helpers/dom/assertions'
import {hasDOMFocus} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {rowDragHandleIsVisible} from '../../helpers/table/assertions'
import {setCellToFocusMode} from '../../helpers/table/interactions'
import {cellTestId, getTableRowIndex, getTableRowWithinGroup} from '../../helpers/table/selectors'
import {waitForFunction} from '../../helpers/utils'

test.describe('Focus between views', () => {
  // https://github.com/github/memex/issues/9290
  test.fixme(
    'Focus stays on first card or cell when swapping between views, resetting scroll position',
    async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithSavedViews')

      await expect(page.getByRole('grid')).toBeVisible()
      /**
       * On initial load, ensure the first navigable cell is focused
       */

      expect(await hasDOMFocus(page, await mustFind(page, _(cellTestId(0, 'Title'))))).toBe(true)

      await rowDragHandleIsVisible(page, 0)

      /**
       * Focus the last cell, first row in the first view
       */
      await setCellToFocusMode(page, _(cellTestId(0, 'Due Date')))

      /**
       * Navigate to the second view
       */
      await memex.views.VIEW_TABS.nth(1).click()

      await expect(page.getByRole('grid')).toBeVisible()

      // locate the index of the top row in the expected group
      const row = await getTableRowWithinGroup(page, 'Done', 0)
      const index = await getTableRowIndex(row)

      /**
       * Ensure the first navigable cell is focused
       */
      const assigneesSelector = await mustFind(page, _(cellTestId(index, 'Assignees')))
      expect(await hasDOMFocus(page, assigneesSelector)).toBe(true)

      await rowDragHandleIsVisible(page, 0)

      /**
       * Focus the last cell, first row in the view
       */
      await setCellToFocusMode(page, _(cellTestId(0, 'Due Date')))

      await memex.views.VIEW_TABS.nth(0).click()
      await expect(page.getByRole('grid')).toBeVisible()

      const titleElement = await mustFind(page, _(cellTestId(0, 'Title')))
      expect(await hasDOMFocus(page, titleElement)).toBe(true)

      await rowDragHandleIsVisible(page, 0)

      /**
       * Focus the last cell, first row in the first view
       */
      await setCellToFocusMode(page, _(cellTestId(0, 'Due Date')))

      /**
       * Focus the last cell, first row in the first view
       */
      await memex.views.VIEW_TABS.nth(2).click()

      await memex.boardView.expectVisible()

      await memex.boardView.getCard('Backlog', 0).expectToBeFocused()
    },
  )

  // https://github.com/github/memex/issues/9308
  test.fixme('properly handles popstate events', async ({page, memex}) => {
    test.slow()
    await memex.navigateToStory('integrationTestsWithSavedViews')

    await memex.views.expectViewIndexActive(0)
    await memex.filter.filterBy('status:"In Progress"')
    await memex.views.VIEW_TABS.nth(1).click()
    await memex.views.expectViewIndexActive(1)
    await memex.views.VIEW_TABS.nth(2).click()
    await memex.views.expectViewIndexActive(2)

    await memex.filter.filterBy('status')
    await memex.filter.filterBy('status:Backlog')

    await page.goBack()
    await memex.views.expectViewIndexActive(2)
    await expectSearchValueToEqual(memex, 'status')

    await page.goBack()
    await memex.views.expectViewIndexActive(2)
    await expectSearchValueToEqual(memex, '')

    await page.goBack()
    await memex.views.expectViewIndexActive(1)
    await expectSearchValueToEqual(memex, '')

    await page.goBack()
    await memex.views.expectViewIndexActive(0)
    await expectSearchValueToEqual(memex, 'status:"In Progress"')

    await page.goBack()
    await memex.views.expectViewIndexActive(0)
    await expectSearchValueToEqual(memex, '')

    await page.goForward()
    await memex.views.expectViewIndexActive(0)
    await expectSearchValueToEqual(memex, 'status:"In Progress"')

    await page.goForward()
    await memex.views.expectViewIndexActive(1)
    await expectSearchValueToEqual(memex, '')

    await page.goForward()
    await memex.views.expectViewIndexActive(2)
    await expectSearchValueToEqual(memex, '')

    await page.goForward()
    await memex.views.expectViewIndexActive(2)
    await expectSearchValueToEqual(memex, 'status:Backlog')
  })
})

async function expectSearchValueToEqual(memex: MemexApp, str: string) {
  return waitForFunction(async () => {
    const inputValue = await memex.filter.INPUT.inputValue()
    return inputValue === str
  })
}
