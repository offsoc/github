import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'

test.describe('Entering edit mode when cell is not focused', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues')
  })

  test('Single clicking on the caret in an unfocused cell puts it in edit mode', async ({memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(0)

    await cell.expectDefault()

    await cell.DROPDOWN_BUTTON.click()

    await cell.expectEditing()
  })

  test('Double clicking on an unfocused cell puts it in edit mode', async ({memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(0)

    await cell.setToEditMode()

    await cell.expectEditing()
  })
})

test.describe('Entering edit mode from focus mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues')
  })

  test('Pressing Enter opens select menu with focus', async ({page, memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(0)
    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Enter')
    await expect(page.getByTestId('item-picker-root')).toBeVisible()
    await cell.expectEditing()
  })

  test('Pressing Backspace clears the cell without opening edit mode', async ({page, memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(0)
    await cell.expectText('Parent One #10')

    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Backspace')

    await cell.expectText('')
    await cell.expectFocused()
  })

  test('Pressing Delete clears the cell without opening edit mode', async ({page, memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(0)
    await cell.expectText('Parent One #10')

    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Delete')

    await cell.expectText('')
    await cell.expectFocused()
  })

  test('Pressing Escape returns to focus mode without saving', async ({page, memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(0)
    await cell.expectText('Parent One #10')

    await cell.setToEditMode()
    await cell.expectEditing()

    await page.keyboard.press('Escape')

    await cell.expectFocused()
    await expect(page.getByTestId('item-picker-root')).toBeHidden()
    await cell.expectText('Parent One #10')
  })
})

test.describe('Updating value', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues')
  })

  test('Updating value in select menu saves the value to the cell', async ({page, memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(0)
    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Enter')
    await expect(page.getByTestId('item-picker-root')).toBeVisible()
    await cell.expectEditing()

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('item-picker-root')).toBeHidden()

    await expect(cell.locator.getByText('Parent Two #11')).toBeVisible()
  })

  test('Pressing any Arrow keys while focused on filter input does not leave edit mode', async ({page, memex}) => {
    const cell = memex.tableView.cells.getParentIssueCell(3)
    await cell.setToEditMode()
    await cell.expectEditing()

    await expect(page.getByTestId('item-picker-root')).toBeVisible()

    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowRight')

    await cell.expectEditing()
  })
})

test.describe('Error handling', () => {
  test('When an update throws an error an alert is shown', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      forceErrorMode: true,
    })

    const cell = memex.tableView.cells.getParentIssueCell(0)
    await cell.expectText('Parent One #10')

    await cell.setToEditMode()
    await cell.expectEditing()

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('item-picker-root')).toBeHidden()
    await expect(page.getByRole('alertdialog', {name: "Parent issue can't be updated"})).toBeVisible()
    await expect(page.getByRole('alertdialog')).toContainText("Parent issue can't be updated")
    await expect(page.getByRole('alertdialog')).toContainText('Failed to update item')
  })
})
