import {expect} from '@playwright/test'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {setCellToFocusMode} from '../../helpers/table/interactions'
import {cellTestId} from '../../helpers/table/selectors'
import {testPlatformMeta} from '../../helpers/utils'

test.describe('navigationAndFocus', () => {
  test.describe('Selecting rows', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
      })
    })

    test('shift+space selects a row', async ({page, memex}) => {
      await memex.roadmapPage.getCell(0, 'Title').focus()
      await page.keyboard.press('Shift+ ')

      await memex.roadmapPage.expectRowToBeSelected(0)

      await page.keyboard.press('Escape')

      await memex.roadmapPage.expectRowNotToBeSelected(0)
    })

    test('selects a row on ranking number click', async ({page, memex}) => {
      const handle1 = memex.roadmapPage.getRowDragHandle(0)
      await handle1.click()

      await memex.roadmapPage.expectRowToBeSelected(0)

      await page.keyboard.press('Escape')

      await memex.roadmapPage.expectRowNotToBeSelected(0)
    })

    test('shift+up/down arrow selects rows', async ({page, memex}) => {
      await memex.roadmapPage.getRowDragHandle(0).click()

      await page.keyboard.press('Shift+ArrowDown') // select row 2
      await page.keyboard.press('Shift+ArrowDown') // select row 3
      await page.keyboard.press('Shift+ArrowUp') // unselect row 3

      await memex.roadmapPage.expectRowToBeSelected(0)
      await memex.roadmapPage.expectRowToBeSelected(1)
      await memex.roadmapPage.expectRowNotToBeSelected(2)
    })

    test('click on the row dragger select a row', async ({memex}) => {
      await memex.roadmapPage.getRowDragHandle(1).click()

      await memex.roadmapPage.expectRowToBeSelected(1)
    })

    test('shift+click on the row dragger select multiple rows', async ({page, memex}) => {
      await memex.roadmapPage.getRowDragHandle(0).click()

      await page.keyboard.down('Shift')

      await memex.roadmapPage.getRowDragHandle(2).click()

      await page.keyboard.up('Shift')

      await memex.roadmapPage.expectRowToBeSelected(0)
      await memex.roadmapPage.expectRowToBeSelected(1)
      await memex.roadmapPage.expectRowToBeSelected(2)
      await memex.roadmapPage.expectRowNotToBeSelected(3)
    })

    test('meta+click on the row dragger select and toggle multiple rows', async ({page, memex}) => {
      await memex.roadmapPage.getRowDragHandle(0).click()

      await page.keyboard.down(testPlatformMeta)

      await memex.roadmapPage.getRowDragHandle(2).click()

      await page.keyboard.up(testPlatformMeta)

      await memex.roadmapPage.expectRowToBeSelected(0)
      await memex.roadmapPage.expectRowNotToBeSelected(1)
      await memex.roadmapPage.expectRowToBeSelected(2)
      await memex.roadmapPage.expectRowNotToBeSelected(3)

      await page.keyboard.down(testPlatformMeta)

      await memex.roadmapPage.getRowDragHandle(2).click()

      await page.keyboard.up(testPlatformMeta)

      await memex.roadmapPage.expectRowToBeSelected(0)
      await memex.roadmapPage.expectRowNotToBeSelected(1)
      await memex.roadmapPage.expectRowNotToBeSelected(2)
      await memex.roadmapPage.expectRowNotToBeSelected(3)
    })

    test('can select and delete multiple rows', async ({page, memex}) => {
      const initialCount = await memex.roadmapPage.getRowCount()

      await memex.roadmapPage.getRowDragHandle(0).click()

      await page.keyboard.down('Shift')

      await memex.roadmapPage.getRowDragHandle(2).click()

      await page.keyboard.up('Shift')

      await memex.roadmapPage.getRowByIndex(0).hover()
      await memex.roadmapPage.ROW_MENU_TRIGGER.first().click()
      await memex.roadmapPage.ROW_MENU_DELETE_MULTIPLE.click()

      await submitConfirmDialog(page, 'Delete')

      const afterCount = await memex.roadmapPage.getRowCount()
      expect(afterCount).toBe(initialCount - 3)
    })

    test('can select and delete multiple rows using keyboard shortcut', async ({page, memex}) => {
      const initialCount = await memex.roadmapPage.getRowCount()

      await memex.roadmapPage.getRowDragHandle(0).click()

      await page.keyboard.down('Shift')

      await memex.roadmapPage.getRowDragHandle(2).click()

      await page.keyboard.up('Shift')

      await page.keyboard.press('Delete')

      await submitConfirmDialog(page, 'Delete')

      const afterCount = await memex.roadmapPage.getRowCount()
      expect(afterCount).toBe(initialCount - 3)
    })

    test('can select and archive multiple rows', async ({page, memex}) => {
      const initialCount = await memex.roadmapPage.getRowCount()

      await memex.roadmapPage.getRowDragHandle(0).click()

      await page.keyboard.down('Shift')

      await memex.roadmapPage.getRowDragHandle(2).click()

      await page.keyboard.up('Shift')

      await memex.roadmapPage.getRowByIndex(0).hover()
      await memex.roadmapPage.ROW_MENU_TRIGGER.first().click()
      await memex.roadmapPage.ROW_MENU_ARCHIVE_MULTIPLE.click()

      await submitConfirmDialog(page, 'Archive')

      const afterCount = await memex.roadmapPage.getRowCount()
      expect(afterCount).toBe(initialCount - 3)
    })

    test('can select and archive multiple rows using keyboard shortcut', async ({page, memex}) => {
      const initialCount = await memex.roadmapPage.getRowCount()

      await memex.roadmapPage.getRowDragHandle(0).click()

      await page.keyboard.down('Shift')

      await memex.roadmapPage.getRowDragHandle(2).click()

      await page.keyboard.up('Shift')

      await page.keyboard.press('e')

      await submitConfirmDialog(page, 'Archive')

      const afterCount = await memex.roadmapPage.getRowCount()
      expect(afterCount).toBe(initialCount - 3)
    })
  })

  test.describe('Selecting grouped rows', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
        groupedBy: {
          columnId: SystemColumnId.Status,
        },
      })
    })

    test('can select rows across groups', async ({page, memex}) => {
      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()
      await page.keyboard.press('Shift+ ')
      await page.keyboard.press('Shift+ArrowDown')
      await page.keyboard.press('Shift+ArrowDown')

      await memex.roadmapPage.expectRowToBeSelected(0, 'Backlog')
      await memex.roadmapPage.expectRowToBeSelected(1, 'Backlog')
      await memex.roadmapPage.expectRowToBeSelected(0, 'Done')
      await memex.roadmapPage.expectRowNotToBeSelected(1, 'Done')
    })
  })

  test.describe('Selecting sorted rows', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
        sortedBy: {
          columnId: SystemColumnId.Status,
          direction: 'asc',
        },
      })
    })

    test('for a sorted table shift+click on the row dragger works as expected', async ({page, memex}) => {
      await setCellToFocusMode(page, _(cellTestId(0, 'row-drag-handle')))

      await page.keyboard.down('Shift')

      await setCellToFocusMode(page, _(cellTestId(2, 'row-drag-handle')))

      await page.keyboard.up('Shift')

      await memex.roadmapPage.expectRowToBeSelected(0)
      await memex.roadmapPage.expectRowToBeSelected(1)
      await memex.roadmapPage.expectRowToBeSelected(2)
      await memex.roadmapPage.expectRowNotToBeSelected(3)
    })
  })
})
