import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

test.describe('Create columns', () => {
  test('Columns can be created by clicking the new column button', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    const newColumnName = 'New Column'

    // Precondition: The new column name is new.
    await memex.boardView.getColumn(newColumnName).expectHidden()

    await memex.boardView.clickAddColumnButton()
    await memex.boardView.clickConfirmAddColumnButton()

    const titleInput = memex.boardView.ADD_NEW_COLUMN_TEXT_INPUT
    await expect(titleInput).toBeVisible()
    await titleInput.type(newColumnName)
    await titleInput.press('Enter')
    await memex.boardView.getColumn(newColumnName).expectVisible()
  })

  test('New iteration fields can be created by clicking the new column button when grouped by iteration', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
    })
    await memex.boardView.expectVisible()

    const newColumnName = 'Iteration 7'
    await memex.viewOptionsMenu.open()
    await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY).toContainText('Status')
    await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY.click()

    await page.waitForSelector(_('group-by-menu'))
    const groupByIteration = await page.waitForSelector(_('group-by-Iteration'))
    await groupByIteration.click()

    // Precondition: The new column name is new.
    await memex.boardView.getColumn(newColumnName).expectHidden()

    await memex.boardView.clickAddColumnButton()
    await memex.boardView.clickConfirmAddColumnButton()

    await memex.boardView.getColumn(newColumnName).expectVisible()
  })
})
