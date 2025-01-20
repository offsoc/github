import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {eventually} from '../../helpers/utils'
import {CellMode} from '../../types/table'

test.describe('Roadmap cell navigation and editing', () => {
  test.describe('grouped view', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
        groupedBy: {
          columnId: 'Status',
        },
      })
    })

    test('ArrowUp + ArrowDown navigates between items and grouped omnibars', async ({memex, page}) => {
      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()

      await page.keyboard.press('ArrowUp')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getCellMode(1, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getGroupOmnibarHasFocus('Backlog')).toBe(true)

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Done')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowUp')

      expect(await memex.roadmapPage.getGroupOmnibarHasFocus('Backlog')).toBe(true)

      await page.keyboard.press('ArrowUp')

      expect(await memex.roadmapPage.getCellMode(1, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      // Move to last item row
      const lastRowIndex = await memex.roadmapPage.getLastRowIndex('No Status')

      await memex.roadmapPage.getTitleCell(lastRowIndex, 'No Status').click()

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getGroupOmnibarHasFocus('No Status')).toBe(true)

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getGroupOmnibarHasFocus('No Status')).toBe(true)
    })

    test('ArrowLeft + ArrowRight navigates between columns', async ({memex, page}) => {
      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.ROADMAP_SHOW_DATE_FIELDS.click()
      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').click({position: {x: 0, y: 0}})

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowLeft')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowRight')

      expect(await memex.roadmapPage.getCellMode(0, 'Due Date', 'Backlog')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowRight')

      expect(await memex.roadmapPage.getCellMode(0, 'Due Date', 'Backlog')).toBe(CellMode.DEFAULT)

      await expect(memex.roadmapPage.getAddDateButtonForRow(0, 'Backlog')).toBeFocused()

      await page.keyboard.press('ArrowRight')

      await expect(memex.roadmapPage.getAddDateButtonForRow(0, 'Backlog')).toBeFocused()

      await page.keyboard.press('ArrowLeft')

      expect(await memex.roadmapPage.getCellMode(0, 'Due Date', 'Backlog')).toBe(CellMode.FOCUSED)
    })

    test('clicking outside of title cell clears focus', async ({memex, page}) => {
      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()

      await page.getByTestId('roadmap-add-date-button').first().click()

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)

      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').click({position: {x: 0, y: 0}})

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      await memex.roadmapPage.getCell(1, 'Title', 'Backlog').click({position: {x: 0, y: 0}})

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)

      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').click({position: {x: 0, y: 0}})

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      await memex.roadmapPage.ROADMAP_HEADER_DRAG_SASH.first().click()

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)

      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').click({position: {x: 0, y: 0}})

      await memex.roadmapPage.getPill({name: /Fixes/}).visiblePill.locator.click()

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)
    })

    test('tabbing outside of title cell clears focus', async ({memex, page}) => {
      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()

      await page.keyboard.press('Shift+Tab')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)

      await page.keyboard.press('Tab')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('Tab')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)
    })

    test('can shift+click to bulk select items', async ({memex, page}) => {
      const cell0 = memex.roadmapPage.getCell(0, 'Title', 'Backlog')

      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()
      expect(await cell0.getAttribute('class')).toContain('is-focused')

      await page.keyboard.down('Shift')

      await memex.roadmapPage.getCell(1, 'Title', 'Backlog').click()

      expect(await memex.roadmapPage.getCellMode(1, 'Title', 'Backlog')).not.toBe(CellMode.FOCUSED)

      await eventually(async () => {
        expect(await cell0.getAttribute('class')).toContain('is-focused')
      })
    })

    test('can edit title cell by pressing Enter on focused cell', async ({memex, page}) => {
      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()

      await page.keyboard.press('Enter')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.EDITING)

      await page.keyboard.type('-edited')

      await page.keyboard.press('Enter')

      expect(await memex.roadmapPage.getCellMode(0, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)

      await eventually(async () => {
        expect(await memex.roadmapPage.getCell(0, 'Title', 'Backlog').textContent()).toContain('-edited')
      })
    })

    test('can edit title cell by double clicking on cell', async ({memex, page}) => {
      const cell = memex.roadmapPage.getTitleCell(1, 'Backlog')

      await cell.dblclick()

      await page.keyboard.type('-edited')

      await page.keyboard.press('Enter')

      expect(await memex.roadmapPage.getCellMode(1, 'Title', 'Backlog')).toBe(CellMode.DEFAULT)

      await eventually(async () => {
        expect(await cell.textContent()).toContain('-edited')
      })
    })

    test('can enter the date picker via enter or double-click', async ({memex, page}) => {
      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.ROADMAP_SHOW_DATE_FIELDS.click()

      const cell = memex.roadmapPage.getCell(1, 'Due Date', 'Backlog')

      await cell.click()

      await page.keyboard.press('Enter')

      await expect(page.getByTestId('datepicker-panel')).toBeVisible()

      await page.keyboard.press('Escape')

      await cell.dblclick()

      await expect(page.getByTestId('datepicker-panel')).toBeVisible()
    })
  })

  test.describe('non-grouped', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
      })
    })

    test('focuses on the omnibar last on arrow key navigation', async ({memex, page}) => {
      // Move to last item row
      const lastRowIndex = await memex.roadmapPage.getLastRowIndex()
      await memex.roadmapPage.getTitleCell(lastRowIndex).click()

      expect(await memex.roadmapPage.getCellMode(lastRowIndex, 'Title')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getOmnibarHasFocus()).toBe(true)

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getOmnibarHasFocus()).toBe(true)

      await page.keyboard.press('ArrowUp')

      expect(await memex.roadmapPage.getOmnibarHasFocus()).toBe(false)

      expect(await memex.roadmapPage.getCellMode(7, 'Title')).toBe(CellMode.FOCUSED)
    })
  })

  test.describe('navigation between roadmap elements', () => {
    test('ArrowUp + ArrowDown navigation between roadmap pill area items', async ({memex, page}) => {
      await memex.navigateToStory('appWithRoadmapLayout', {
        groupedBy: {
          columnId: 'Status',
        },
      })

      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()

      await page.keyboard.press('ArrowRight')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(0, 'Backlog')

      await page.keyboard.press('ArrowUp')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(0, 'Backlog')

      await page.keyboard.press('ArrowDown')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(1, 'Backlog')

      await page.keyboard.press('ArrowDown')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(2, 'Backlog')

      await page.keyboard.press('ArrowDown')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(3, 'Backlog')

      await page.keyboard.press('ArrowDown')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(4, 'Backlog')

      // Move to last item row
      const lastRowIndex = await memex.roadmapPage.getLastRowIndex('Backlog')

      await memex.roadmapPage.getTitleCell(lastRowIndex, 'Backlog').focus()

      await page.keyboard.press('ArrowRight')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(lastRowIndex, 'Backlog')

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getGroupOmnibarHasFocus('Backlog')).toBe(true)

      await page.keyboard.press('ArrowUp')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(lastRowIndex, 'Backlog')
    })

    test('refocuses pill items after after scrolling to date', async ({memex, page}) => {
      await memex.navigateToStory('appWithDateItems', {
        viewType: 'roadmap',
      })
      await memex.roadmapPage.getCell(0, 'Title').focus()

      await page.keyboard.press('ArrowDown')

      expect(await memex.roadmapPage.getCellMode(1, 'Title')).toBe(CellMode.FOCUSED)

      // Use fixture referencing 2021 date
      expect(await memex.roadmapPage.getCell(1, 'Title').textContent()).toContain(
        'Add integration tests for undo/redo functionality',
      )

      await page.keyboard.press('ArrowRight')

      await expect(memex.roadmapPage.getNavigationButtonForRow(1)).toBeFocused()

      await page.keyboard.press('Enter')

      await expect(memex.roadmapPage.getItemLinkForRow(1)).toBeFocused()
    })

    test('refocuses pill items after after adding dates', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
        groupedBy: {
          columnId: 'Status',
        },
      })
      await memex.roadmapPage.getCell(0, 'Title', 'Backlog').focus()

      await page.keyboard.press('ArrowRight')

      await expect(memex.roadmapPage.getAddDateButtonForRow(0, 'Backlog')).toBeFocused()

      await page.keyboard.press('Enter')

      await expect(memex.roadmapPage.getItemLinkForRow(0, 'Backlog')).toBeFocused()
    })

    test('pills missing dates are skipped in readonly mode during navigation', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsInReadonlyMode', {
        viewType: 'roadmap',
      })

      await memex.roadmapPage.getCell(0, 'Title').focus()

      await page.keyboard.press('ArrowRight')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(0)

      await page.keyboard.press('ArrowDown')

      // Skip to next pill item
      await memex.roadmapPage.pillAreaElementInRowHasFocus(3)

      await page.keyboard.press('ArrowDown')

      await memex.roadmapPage.pillAreaElementInRowHasFocus(6)

      await page.keyboard.press('ArrowLeft')

      expect(await memex.roadmapPage.getCellMode(6, 'Title')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowUp')

      expect(await memex.roadmapPage.getCellMode(5, 'Title')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowRight')

      // Cannot move over to roadmap pill area
      expect(await memex.roadmapPage.getCellMode(5, 'Title')).toBe(CellMode.FOCUSED)
    })

    test('redacted items are skipped during navigation', async ({memex, page}) => {
      await memex.navigateToStory('appWithIterationsField', {
        viewType: 'roadmap',
      })

      const title = "You don't have permission to access this item"
      await memex.roadmapPage.getCell(4, 'Title').click()
      await expect(memex.roadmapPage.getCell(4, 'Title')).toHaveText(title)

      expect(await memex.roadmapPage.getCellMode(4, 'Title')).toBe(CellMode.FOCUSED)

      await page.keyboard.press('ArrowRight')

      expect(await memex.roadmapPage.getCellMode(4, 'Title')).toBe(CellMode.FOCUSED)
    })

    test('removes pill element focus when tabbing to an assignee', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
      })

      const link = memex.roadmapPage.getItemLinkForRow(3)
      await link.focus()
      expect(await link.getAttribute('class')).toContain('is-focused')

      await page.keyboard.press('Tab')

      await expect(
        memex.roadmapPage.getRowByIndex(3).getByTestId('roadmap-item-assignees').getByTestId('AvatarItemFilterButton'),
      ).toBeFocused()
      expect(await link.getAttribute('class')).not.toContain('is-focused')

      await page.keyboard.press('Shift+Tab')

      await expect(link).toBeFocused()
      expect(await link.getAttribute('class')).toContain('is-focused')
    })
  })
})
