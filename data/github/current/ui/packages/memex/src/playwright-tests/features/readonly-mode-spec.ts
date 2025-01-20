import {expect, type Page} from '@playwright/test'

import {test} from '../fixtures/test-extended'
import {_} from '../helpers/dom/selectors'
import {isGroupedBy, isNotGroupedBy} from '../helpers/table/assertions'
import {setCellToEditMode as dblClickCell, toggleGroupBy} from '../helpers/table/interactions'
import {getCellMode, rowTestId} from '../helpers/table/selectors'
import {CellMode} from '../types/table'

test.describe('Readonly Mode', () => {
  test.describe('in table', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsInReadonlyMode')
    })

    test('memex title is not editable', async ({page, memex}) => {
      const headerElement = page.getByRole('heading', {level: 1})
      await expect(headerElement).toBeVisible()

      await expect(memex.topBarNavigation.EDIT_PROJECT_NAME_BUTTON).toHaveCount(0)

      // Should _not_ navigate to settings on name click
      await headerElement.click()
      await expect(memex.projectSettingsPage.PROJECT_NAME_INPUT).toHaveCount(0)
    })

    test('settings button is not available', async ({memex}) => {
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
      await expect(memex.topBarNavigation.SETTINGS_NAV_BUTTON).toHaveCount(0)
    })

    test('table cells are rendered as readonly', async ({page}) => {
      const selector = 'TableCell{row: 1, column: Status}'
      const field = page.getByTestId(selector)

      // Click twice to try and trigger the option menu
      await field.click()
      await field.click()
      await expectFieldToNotBeRendered(page, 'TableCellEditor{row: 1, column: Status}')
    })

    test('item title field is not editable', async ({page}) => {
      const cellSelector = _('TableCell{row: 0, column: Title}')
      await dblClickCell(page, cellSelector)
      expect(await getCellMode(page, cellSelector)).not.toBe(CellMode.EDITING)
    })

    test('row action menu is not present', async ({page}) => {
      await expectFieldToNotBeRendered(page, 'row-menu-trigger')
    })

    test('drag and drop is disabled', async ({page}) => {
      await expectFieldToNotBeRendered(page, null, `[data-testid="${rowTestId(15)}"] div[draggable]`)
    })
    test('omnibar is not present', async ({page}) => {
      await expectFieldToNotBeRendered(page, 'omnibar')
    })
  })

  test.describe('in board', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsInReadonlyMode', {
        viewType: 'board',
      })
    })

    test('cannot rename a column', async ({memex}) => {
      await expect(memex.boardView.COLUMNS.getByRole('button', {name: /actions for column:/i})).toBeHidden()
    })

    test('delete item button is not present', async ({page}) => {
      await expectFieldToNotBeRendered(page, 'card-context-menu-trigger')
    })

    test('drag and drop is disabled', async ({page}) => {
      const card = page.getByTestId('board-view-column-card')
      const disabledAttribute = await card.nth(0).getAttribute('aria-disabled')
      expect(disabledAttribute).toBeTruthy()
    })

    test('add new item is not rendered', async ({page}) => {
      await expectFieldToNotBeRendered(page, 'board-view-add-card-button')
    })

    test('omnibar is not present', async ({page}) => {
      await page.keyboard.press('Control+Space')
      await expectFieldToNotBeRendered(page, 'omnibar')
    })
  })

  test.describe('views option menu', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsInReadonlyMode')
    })

    test('views are not drag-and-droppable', async ({page}) => {
      const viewsLocator = page.getByTestId('tab-nav')
      await expect(viewsLocator.locator('[data-dnd-drag-transform-disable=false]')).toHaveCount(0)
      await expect(viewsLocator.locator('[data-dnd-drag-transform-disable=true]')).toHaveCount(3)
    })
  })

  test.describe('views option menu', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsInReadonlyMode')
    })

    test('discard changes option is not disabled', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')
      await isGroupedBy(page, 'Status', 'Done')

      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.RESET_CHANGES.click()

      await memex.viewOptionsMenu.expectViewStateNotDirty()
      await isNotGroupedBy(page, 'Status', 'Done')
    })

    test('duplicate view option is not displayed', async ({memex}) => {
      await memex.viewOptionsMenu.open()
      await expect(memex.viewOptionsMenu.duplicateViewItem()).toBeHidden()
    })

    test('save changes is not displayed', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')
      await isGroupedBy(page, 'Status', 'Done')

      await memex.viewOptionsMenu.open()
      await expect(memex.viewOptionsMenu.SAVE_CHANGES).toBeHidden()
    })

    test('project info button is visible', async ({page}) => {
      await expect(page.getByTestId('project-memex-info-button')).toHaveCount(1)
    })
  })

  async function expectFieldToNotBeRendered(page: Page, testId?: string, selector?: string) {
    // eslint-disable-next-line playwright/no-element-handle
    const field = await (testId ? page.$(_(testId)) : page.$(selector))
    expect(field).toBeNull()
  }
})
