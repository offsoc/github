import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'

test.describe('Entering edit mode when cell is not focused', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Editor is not avaiable for pull requests', async ({memex}) => {
    const pull = memex.tableView.cells.getIssueTypeCell(1)

    await pull.expectReadonly()
  })

  test('Editor is available for issues and drafts', async ({memex}) => {
    const issue = memex.tableView.cells.getIssueTypeCell(0)

    await issue.expectEditable()

    const draft = memex.tableView.cells.getIssueTypeCell(2)

    await draft.expectEditable()
  })

  test('Single clicking on the caret in an unfocused cell puts it in edit mode', async ({memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)

    await cell.expectDefault()

    await cell.DROPDOWN_BUTTON.click()

    await cell.expectEditing()
  })

  test('Double clicking on an unfocused cell puts it in edit mode', async ({memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)

    await cell.setToEditMode()

    await cell.expectEditing()
  })
})

test.describe('Entering edit mode from focus mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Pressing Enter opens select menu with focus on empty filter input', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Enter')
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectToBeVisible()
    await memex.tableView.cellEditor.expectInputFocused()
    await memex.tableView.cellEditor.expectInputValue('')
  })

  test('Pressing [A-z] opens select menu with focus on filter input with typed character', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.type('h')
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectToBeVisible()
    await memex.tableView.cellEditor.expectInputFocused()
    await memex.tableView.cellEditor.expectInputValue('h')
  })

  test('Pressing Backspace clears the cell without opening edit mode', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.expectText('Batch')

    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Backspace')

    await cell.expectText('')
    await cell.expectFocused()
  })

  test('Pressing Delete clears the cell without opening edit mode', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.expectText('Batch')

    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Delete')

    await cell.expectText('')
    await cell.expectFocused()
  })

  test('Filtering cell returns filtered options', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Enter')
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectInputFocused()
    await memex.tableView.cellEditor.filterOptions('Feature')
    await memex.tableView.cellEditor.expectOptionsCount(1)
  })

  test('Filtering cell returns empty results if no results exist', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.setToFocusMode()
    await cell.expectFocused()

    await page.keyboard.press('Enter')

    await cell.expectEditing()
    await memex.tableView.cellEditor.expectOptionsCount(6)

    await memex.tableView.cellEditor.expectInputFocused()
    await memex.tableView.cellEditor.filterOptions('Non Existent Issue Type')
    await memex.tableView.cellEditor.expectOptionsCount(0)
    await expect(memex.tableView.cellEditor.EMPTY_ROW).toBeVisible()
    await expect(memex.tableView.cellEditor.ADD_OPTION).toBeHidden() // New issue types can't be created
  })
})

test.describe('Exiting edit mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Pressing Escape returns to focus mode without saving', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.expectText('Batch')

    await cell.setToEditMode()
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectOptionsCount(6)
    await page.keyboard.press('Escape')

    await cell.expectFocused()
    await memex.tableView.cellEditor.expectToBeHidden()
    await cell.expectText('Batch')
  })

  test('Clicking a selection returns to focus button and updates value', async ({memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.expectText('Batch')

    await cell.setToEditMode()
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectOptionsCount(6)
    await memex.tableView.cellEditor.selectOption('Feature')

    await cell.expectFocused()
    await memex.tableView.cellEditor.expectToBeHidden()
    await cell.expectText('Feature')
  })

  test('Pressing Enter on a selection focuses next row and updates value', async ({page, memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.expectText('Batch')

    await cell.setToEditMode()
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectOptionsCount(6)
    await memex.tableView.cellEditor.filterOptions('Bug')

    await memex.tableView.cellEditor.expectOptionsCount(1)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await memex.tableView.cellEditor.expectToBeHidden()

    await cell.expectDefault()
    await cell.expectText('Bug')
    await memex.tableView.cells.getIssueTypeCell(4).expectFocused()
  })

  test('Pressing any Arrow keys while focused on filter input does not leave edit mode', async ({memex}) => {
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.setToEditMode()
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectOptionsCount(6)
    await memex.tableView.cellEditor.expectInputFocused()

    const input = memex.tableView.cellEditor.getTextInput()
    await input.press('ArrowUp')
    await input.press('ArrowDown')
    await input.press('ArrowLeft')
    await input.press('ArrowRight')

    await cell.expectEditing()
  })
})

test.describe('Error handling', () => {
  test('showing error message when failing to load suggestions', async ({memex}) => {
    await memex.navigateToStory('integrationTestsInErrorMode')
    const cell = memex.tableView.cells.getIssueTypeCell(3)
    await cell.setToEditMode()
    await cell.expectEditing()

    await memex.tableView.cellEditor.expectErrorMessage("You don't have permission to edit this field.")
  })
})
