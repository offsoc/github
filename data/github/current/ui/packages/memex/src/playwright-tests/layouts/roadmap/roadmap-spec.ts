import {expect} from '@playwright/test'

import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'
import {eventually} from '../../helpers/utils'
import {CellMode} from '../../types/table'

test.describe('Roadmap layout', () => {
  test.describe('with date fields', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
    })

    test('renders main content', async ({memex}) => {
      await test.expect(memex.roadmapPage.ROADMAP_HEADER_TODAY).toBeVisible()
      await test.expect(memex.roadmapPage.ROADMAP_HEADER).toBeVisible()
      const pill = memex.roadmapPage.getPill({name: /This Week/})
      await pill.expectToBeVisible()
    })

    test('renders `Today` with start date only', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Today/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()
      test.expect(startDate).toBeInstanceOf(Date)
      test.expect(endDate).toBeInstanceOf(Date)

      test.expect(startDate.getTime()).toEqual(endDate.getTime())
    })

    test('renders pill for This Week with start and end dates', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      test.expect(startDate).toBeInstanceOf(Date)
      test.expect(endDate).toBeInstanceOf(Date)

      test.expect(startDate.getTime()).toBeLessThan(endDate.getTime())
    })

    test('renders pill for Reversed with start and end dates', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Reversed/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      test.expect(startDate).toBeInstanceOf(Date)
      test.expect(endDate).toBeInstanceOf(Date)

      test.expect(startDate.getTime()).toBeLessThan(endDate.getTime())
    })

    test.describe('Controls', () => {
      test.describe('Zoom', () => {
        test('allows saving a new zoom level for a view', async ({memex}) => {
          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Quarter').click()

          await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_DIRTY).toBeVisible()

          await memex.viewOptionsMenu.open()
          await memex.viewOptionsMenu.SAVE_CHANGES.click()

          await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_DIRTY).toBeHidden()
        })

        test('persists zoom level for each view', async ({memex}) => {
          await memex.views.createNewView()
          await expect(memex.views.ACTIVE_TAB).toHaveText('View 100')
          await memex.viewOptionsMenu.switchToRoadmapView()

          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Quarter').click()

          await memex.views.VIEW_TAB_LIST.locator('text=Roadmap').click()
          await expect(memex.views.ACTIVE_TAB).toHaveText('Roadmap')
        })

        test('maintains item visibility in viewport when changing zoom levels', async ({memex}) => {
          const pill = memex.roadmapPage.getPill({name: /This Week/})
          await pill.expectToBeVisible()

          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Quarter').click()

          await pill.expectToBeVisible()

          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
          await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Year').click()

          await pill.expectToBeVisible()
        })
      })
    })
  })

  test.describe('without set date fields', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithReasonField')
    })

    test('opens date config menu if no date fields are set', async ({memex, page}) => {
      await memex.viewOptionsMenu.switchToRoadmapView()

      await page.getByText('Got it').click()
      await page.keyboard.press('Escape')

      await page.getByTestId('roadmap-add-date-button').first().click()

      await expect(page.getByText('New field')).toBeVisible()
    })
  })

  test.describe(`row actions items`, () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
    })

    test('items can be deleted', async ({memex, page}) => {
      await memex.roadmapPage.FILTER_BAR_INPUT.fill('Q1')
      await expect(memex.roadmapPage.getRowByIndex(0)).toBeVisible()
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(1)
      // delete item
      await memex.roadmapPage.getRowByIndex(0).hover()
      await memex.roadmapPage.ROW_MENU_TRIGGER.click()
      await memex.roadmapPage.ROW_MENU_DELETE.click()
      await page.getByRole('button', {name: 'Delete'}).click()
      await expect(memex.roadmapPage.getRowByIndex(0)).toHaveCount(0)
    })

    test('items can be archived', async ({memex, page}) => {
      await memex.roadmapPage.FILTER_BAR_INPUT.fill('Q2')
      await expect(memex.roadmapPage.getRowByIndex(0)).toBeVisible()
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(1)
      // delete item
      await memex.roadmapPage.getRowByIndex(0).hover()
      await memex.roadmapPage.ROW_MENU_TRIGGER.click()
      await memex.roadmapPage.ROW_MENU_ARCHIVE.click()
      await page.getByRole('button', {name: 'Archive'}).click()
      await expect(memex.roadmapPage.getRowByIndex(0)).toHaveCount(0)
    })

    test('draft items can be converted to issues', async ({memex, page}) => {
      await memex.roadmapPage.FILTER_BAR_INPUT.fill('is:draft')
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(10)
      const count = await memex.roadmapPage.ROADMAP_ITEM_ROWS.count()
      // covert item to issue
      await memex.roadmapPage.getRowByIndex(0).hover()
      await memex.roadmapPage.ROW_MENU_TRIGGER.first().click()
      await memex.roadmapPage.ROW_MENU_CONVERT_TO_ISSUE.click()
      await expect(memex.roadmapPage.REPO_PICKER_REPO_LIST).toBeVisible()
      await page.getByRole('option', {name: 'github'}).click()
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(count - 1)
    })

    test('preserves focus when cancelling an action', async ({memex, page}) => {
      await memex.roadmapPage.FILTER_BAR_INPUT.fill('Week')
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(5)
      await expect(memex.roadmapPage.getRowByIndex(0)).toContainText('Week 1')
      // open row menu
      await memex.roadmapPage.getRowByIndex(0).hover()
      await memex.roadmapPage.ROW_MENU_TRIGGER.first().click()
      // open Archive confirmation menu
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Enter')
      // cancel action
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Enter')
      // check that focus is preserved in the menu trigger
      await expect(memex.roadmapPage.ROW_MENU_TRIGGER.first()).toBeFocused()
      await expect(memex.roadmapPage.getRowByIndex(0)).toContainText('Week 1')
    })

    test('focuses next row when triggering an action (archive/delete)', async ({memex, page}) => {
      await memex.roadmapPage.FILTER_BAR_INPUT.fill('Week')
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(5)
      await expect(memex.roadmapPage.getRowByIndex(0)).toContainText('Week 1')
      // covert item to issue
      await memex.roadmapPage.getRowByIndex(0).hover()
      await memex.roadmapPage.ROW_MENU_TRIGGER.first().click()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Enter')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Enter')
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(4)
      await expect(memex.roadmapPage.getRowByIndex(0)).toContainText('Week 2')
      await eventually(async () => {
        expect(await memex.roadmapPage.getCellMode(0, 'Title')).toBe(CellMode.FOCUSED)
      })
    })
  })

  test.describe('Initial focus', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
    })

    const firstCell = (memex: MemexApp) => memex.roadmapPage.getCell(0, 'Title')

    test('Nothing is focused when the page loads', async ({page}) => {
      await expect(page.locator('body')).toBeFocused()
    })

    test('Can jump focus with down arrow after page load', async ({page, memex}) => {
      await page.keyboard.press('ArrowDown')
      await expect(firstCell(memex)).toBeFocused()
    })

    test('Can jump focus with down arrow when tab is focused', async ({page, memex}) => {
      await memex.views.ACTIVE_TAB.focus()
      await page.keyboard.press('ArrowDown')
      await expect(firstCell(memex)).toBeFocused()
    })

    test('Cannot jump focus when anything else is focused', async ({page, memex}) => {
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.focus()
      await page.keyboard.press('ArrowDown')
      await expect(firstCell(memex)).not.toBeFocused()
    })
  })
})
