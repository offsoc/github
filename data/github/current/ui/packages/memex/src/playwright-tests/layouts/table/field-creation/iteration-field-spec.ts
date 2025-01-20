import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {cellTestId, getCellMode} from '../../../helpers/table/selectors'
import {CellMode} from '../../../types/table'

test.describe('iteration field creation', () => {
  test('completes without error', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await page.getByTestId(cellTestId(0, 'Title')).focus()
    const initialFieldCount = await memex.tableView.columns.getVisibleFieldCount()

    const newFieldName = 'Sprint'

    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(newFieldName)
    await addField.setFieldType('iteration')

    await addField.clickSaveButton()

    await memex.tableView.columns.expectVisibleFieldCount(initialFieldCount + 1)

    const newCellSelector = _(cellTestId(0, newFieldName))

    expect(await getCellMode(page, newCellSelector)).toBe(CellMode.FOCUSED)
  })
})
