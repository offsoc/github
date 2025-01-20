import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe('Set Column Limit', () => {
  test('Column limit context menu button should be visible', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.getColumn('Backlog').openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_SET_COLUMN_LIMIT_OPTION).toBeVisible()
  })

  test('Column limit should be set via a modal', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('8')
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('refresh-api-data-url') && resp.status() === 200),
      memex.boardView.clickColumnLimitDialogSubmitButton(),
    ])
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 8')
  })

  test('Column limit input should ignore certain invalid characters (e, E, +, -)', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.openColumnLimitDialog('Backlog')
    await page.keyboard.press('e')
    await page.keyboard.press('E')
    await page.keyboard.press('+')
    await page.keyboard.press('-')
    await page.keyboard.press('.')
    await memex.boardView.setColumnLimit('9')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 9')
  })

  test('Column limit modal should show a validation error when invalid input is entered', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('123.5')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    // expect the error message to be visible when a float is entered
    await expect(page.getByText('This field must be an integer')).toBeVisible()

    await memex.boardView.setColumnLimit('-10')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    // expect the error message to be visible when a negative number is entered
    await expect(page.getByText('This field must be positive or 0')).toBeVisible()
  })

  test('Column limit modal should show a validation error when the limits exceeds the max', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('1000001')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    // expect the error message to be visible when a the limit exceeds the max
    await expect(page.getByText('Column limit is too large')).toBeVisible()

    await memex.boardView.setColumnLimit('1000000')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await expect(page.getByText('Column limit is too large')).toBeHidden()
    // expect it to save when the limit is below the max
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 1000000')
  })

  test('Column limit can be set with leading and/or trailing whitespace', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('  3')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 3')

    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('5  ')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 5')

    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('  8  ')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 8')
  })

  test('Column limit can be set on an iteration column', async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      verticalGroupedBy: {columnId: '20'},
    })

    await memex.boardView.openColumnLimitDialog('Iteration 1')
    await memex.boardView.setColumnLimit('12')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Iteration 1').expectCountInCounterLabel('0 / 12')
  })

  test('Column limit is not set after cancelling', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('8')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 8')

    // re-open the modal and cancel
    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.clickColumnLimitDialogButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 8')
  })

  test('Column limit is saved per view', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
    // set a column limit on the default view
    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('8')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 8')
    // save view changes and create a new view
    await memex.viewOptionsMenu.saveChanges()
    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.duplicateViewItem().click()
    // update this view's column limit to a different value
    await memex.boardView.openColumnLimitDialog('Backlog')
    await memex.boardView.setColumnLimit('5')
    await memex.boardView.clickColumnLimitDialogSubmitButton()
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 5')
    // save view changes and navigate to the default view
    await memex.viewOptionsMenu.saveChanges()
    await memex.views.VIEW_TABS.nth(0).click()
    // ensure that the original view's limit hasn't changed
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel('2 / 8')
  })
})
