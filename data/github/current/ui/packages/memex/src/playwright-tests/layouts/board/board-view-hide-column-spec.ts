import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'
import {BacklogColumn} from '../../types/board'

test.describe('Hide column from context menu', () => {
  test('Hides column after toggling', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.getColumn(BacklogColumn.Label).openContextMenu()

    await expect(memex.boardView.COLUMN_CONTEXT_MENU_HIDE_COLUMN).toBeVisible()
    await memex.boardView.COLUMN_MENU(BacklogColumn.Label).getByRole('menuitem', {name: 'Hide from view'}).click()

    await expect(memex.filter.INPUT).toHaveValue('-status:Backlog')
  })

  test('Hides multi-word column after toggling', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // create multi-word column
    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY.click()
    await page.waitForSelector(_('group-by-menu'))
    const groupByAardvarks = await page.waitForSelector(_('group-by-Neon Alpacas'))
    await groupByAardvarks.click()

    await memex.boardView.getColumn('Aric').openContextMenu()
    await expect(memex.boardView.COLUMN_CONTEXT_MENU_HIDE_COLUMN).toBeVisible()
    await memex.boardView.COLUMN_MENU('Aric').getByRole('menuitem', {name: 'Hide from view'}).click()
    await expect(memex.filter.INPUT).toHaveValue('-neon-alpacas:Aric')
  })
})

test.describe('Toggle columns from + menu', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('+ visibility menu updates filter when toggled', async ({memex}) => {
    await memex.boardView.ADD_NEW_COLUMN_BUTTON.click()
    await memex.boardView.BOARD_VISIBILITY_COLUMN_BACKLOG.click()

    await expect(memex.filter.INPUT).toHaveValue('-status:Backlog')

    await memex.boardView.BOARD_VISIBILITY_COLUMN_BACKLOG.click()
    await expect(memex.filter.INPUT).toHaveValue('')
  })

  test('+menu hides column when column was already included in filter', async ({memex}) => {
    await memex.filter.INPUT.fill('status:Backlog')
    await memex.boardView.ADD_NEW_COLUMN_BUTTON.click()
    await memex.boardView.BOARD_VISIBILITY_COLUMN_BACKLOG.click()

    await expect(memex.filter.INPUT).toHaveValue('-status:Backlog')
  })

  test('+menu shows hidden column when an inclusive filter already exists', async ({memex}) => {
    await memex.filter.INPUT.fill('status:Backlog')
    await memex.boardView.ADD_NEW_COLUMN_BUTTON.click()

    await expect(memex.boardView.ADD_NEW_COLUMN_MENU).toBeVisible()

    await memex.boardView.BOARD_VISIBILITY_COLUMN_READY.click()

    await expect(memex.filter.INPUT).toHaveValue('status:Backlog,Ready')
  })

  test('+menu should be hidden when creating a new column', async ({memex}) => {
    await memex.boardView.ADD_NEW_COLUMN_BUTTON.click()
    await memex.boardView.ADD_NEW_COLUMN_MENU_PLUS_BUTTON.click()

    await expect(memex.boardView.ADD_NEW_COLUMN_MENU).toBeHidden()
  })
})
