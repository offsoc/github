import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {cellTestId, getCellMode} from '../../../helpers/table/selectors'
import {CellMode} from '../../../types/table'

const fieldName = 'New field'

test.describe('focus after adding field', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('focus moves to new column and top row if no focus in table', async ({page, memex}) => {
    const initialFieldCount = await memex.tableView.columns.getVisibleFieldCount()

    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(fieldName)
    await addField.clickSaveButton()

    await memex.tableView.columns.expectVisibleFieldCount(initialFieldCount + 1)

    const topRowAndNewColumn = _(cellTestId(0, fieldName))

    // ensure the table has focus after completing the 'Add field' form and
    // the modal closes
    expect(await getCellMode(page, topRowAndNewColumn)).toBe(CellMode.FOCUSED)
  })

  test('focus moves to new column and current row if focus was initially within table', async ({page, memex}) => {
    const initialFieldCount = await memex.tableView.columns.getVisibleFieldCount()

    const {addField} = memex.tableView

    // focusing on row down the table
    await memex.tableView.cells.setCellToEditMode(3, 'Title')

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(fieldName)
    await addField.clickSaveButton()

    await memex.tableView.columns.expectVisibleFieldCount(initialFieldCount + 1)

    const currentRowAndNewColumn = _(cellTestId(3, fieldName))

    // ensure the table has focus at the current row after completing the
    // 'Add field' form and the modal closes
    expect(await getCellMode(page, currentRowAndNewColumn)).toBe(CellMode.FOCUSED)
  })
})
