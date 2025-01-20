import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {cellTestId} from '../../../helpers/table/selectors'

test.describe('text field creation', () => {
  test('can be created and immediately used', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const fieldName = 'New text field'

    const initialFieldCount = await memex.tableView.columns.getVisibleFieldCount()
    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(fieldName)

    await addField.clickSaveButton()

    await memex.tableView.columns.expectVisibleFieldCount(initialFieldCount + 1)

    const textCellTestId = cellTestId(0, fieldName)

    // Add data for the new field to the current focused cell.
    await page.getByTestId(textCellTestId).focus()

    await page.keyboard.press('Enter')
    await page.keyboard.insertText('hello')
    await page.keyboard.press('Enter')

    // Make sure the new data was persisted.
    expect(await page.getByTestId(textCellTestId).textContent()).toBe('hello')
  })
})
