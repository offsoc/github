import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'

test.describe('single-select field creation', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('is blocked until options are specified', async ({memex, page}) => {
    const newFieldName = 'State'

    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(newFieldName)
    await addField.setFieldType('single-select')

    await addField.expectSaveButtonToBeDisabled()
    await addField.expectFieldName(newFieldName)

    await addField.singleSelectForm.NEW_OPTION_INPUT.fill('Capybara')
    await page.keyboard.press('Enter')

    // input should still be focused
    await page.keyboard.insertText('Badger')
    await page.keyboard.press('Enter')

    await addField.singleSelectForm.expectOptionsCount(2)
    await addField.expectSaveButtonToBeEnabled()
  })

  test('can include emojis and shortcodes for title and options', async ({memex, page}) => {
    const initialColumnCount = await memex.tableView.columns.getVisibleFieldCount()

    const newFieldName = 'Animals 🐶'

    const {addField} = memex.tableView

    await addField.show()

    await addField.clickNewField()

    await addField.setFieldName(newFieldName)
    await addField.setFieldType('single-select')

    await addField.expectSaveButtonToBeDisabled()

    await addField.singleSelectForm.NEW_OPTION_INPUT.fill(':dog: Dog')
    await page.keyboard.press('Enter')

    await addField.singleSelectForm.expectOptionToHaveText(0, '🐶 Dog')

    await addField.clickSaveButton()

    await memex.tableView.columns.expectVisibleFieldCount(initialColumnCount + 1)

    // focus the cell to scroll the view to it
    await memex.tableView.cells.getCellLocator(0, newFieldName).focus()
    await memex.tableView.cells.setCellToEditMode(0, newFieldName)

    await memex.tableView.cellEditor.expectOptionsCount(1)
    // Ensure the emoji is rendered successfully
    await expect(memex.tableView.cellEditor.getOption('🐶 Dog')).toBeVisible()
  })

  test('resets form upon reopening', async ({memex, page}) => {
    const newFieldName = 'Animals 🐶'

    const {addField} = memex.tableView

    await addField.show()

    await addField.clickNewField()

    await addField.setFieldName(newFieldName)
    await addField.setFieldType('single-select')

    await addField.singleSelectForm.NEW_OPTION_INPUT.fill('Dog')
    await page.keyboard.press('Enter')
    await addField.singleSelectForm.expectOptionToHaveText(0, 'Dog')

    await page.keyboard.press('Escape')

    // Re-open add field menu and verify that we have reset the form
    await addField.show()
    await addField.clickNewField()

    await addField.expectFieldType('Text')
    await addField.singleSelectForm.expectOptionsCount(0)
  })

  test('options can be removed during setup, but not last option', async ({memex, page}) => {
    const newFieldName = 'Animals 🐶'

    const {addField} = memex.tableView

    await addField.show()

    await addField.clickNewField()

    await addField.setFieldName(newFieldName)
    await addField.setFieldType('single-select')

    // populate options using keyboard
    await addField.singleSelectForm.NEW_OPTION_INPUT.fill('Dingo')
    await page.keyboard.press('Enter')
    await page.keyboard.type('Elephant')
    await page.keyboard.press('Enter')

    // check that we have the expected options after data entry
    await addField.singleSelectForm.expectOptionToHaveText(0, 'Dingo')
    await addField.singleSelectForm.expectOptionToHaveText(1, 'Elephant')

    await addField.singleSelectForm.clickRemoveOption(0)

    // first option removed, second option is now in index 1
    await addField.singleSelectForm.expectOptionsCount(1)
    await addField.singleSelectForm.expectOptionToHaveText(0, 'Elephant')

    // confirm first option no longer has "remove" icon
    await addField.singleSelectForm.expectRemoveOptionNotFound(0)
  })

  test('options can be edited after adding', async ({memex, page}) => {
    const newFieldName = 'State'

    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(newFieldName)
    await addField.setFieldType('single-select')

    await addField.expectSaveButtonToBeDisabled()
    await addField.expectFieldName(newFieldName)

    await addField.singleSelectForm.NEW_OPTION_INPUT.fill('Dog')
    await page.keyboard.press('Enter')

    await addField.singleSelectForm.clickEditOption(0)

    const dialog = memex.editOptionDialog

    await expect(dialog.DIALOG).toBeVisible()

    await dialog.getColorRadio('RED').click()
    await expect(
      dialog.DIALOG,
      "Clicking in the 'Edit option' dialog should not register as a 'click-outside'/cancel event for the 'Add field' flow",
    ).toBeVisible()

    await dialog.NAME_INPUT.fill('Capybara')

    await dialog.DESCRIPTION_INPUT.fill('Capybara description')

    await dialog.SAVE_BUTTON.click()

    await addField.singleSelectForm.expectOptionToHaveText(0, 'Capybara')
    await expect(addField.singleSelectForm.OPTION.nth(0)).toHaveText(/Capybara description/)
  })

  test(`html entities aren't rendered in descriptions`, async ({memex, page}) => {
    const newFieldName = 'State'

    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(newFieldName)
    await addField.setFieldType('single-select')

    await addField.expectSaveButtonToBeDisabled()
    await addField.expectFieldName(newFieldName)

    await addField.singleSelectForm.NEW_OPTION_INPUT.fill('Car')
    await page.keyboard.press('Enter')

    await addField.singleSelectForm.clickEditOption(0)

    const dialog = memex.editOptionDialog

    await expect(dialog.DIALOG).toBeVisible()

    await dialog.getColorRadio('RED').click()
    await expect(
      dialog.DIALOG,
      "Clicking in the 'Edit option' dialog should not register as a 'click-outside'/cancel event for the 'Add field' flow",
    ).toBeVisible()

    await dialog.NAME_INPUT.fill('Vehicle')

    await dialog.DESCRIPTION_INPUT.fill('Buses &amp; cars')

    await dialog.SAVE_BUTTON.click()

    await addField.singleSelectForm.expectOptionToHaveText(0, 'Vehicle')
    await expect(addField.singleSelectForm.OPTION.nth(0)).toHaveText(/Buses & cars/)
  })
})
