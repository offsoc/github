import {test} from '../../../fixtures/test-extended'
import {mustHaveDescription} from '../../../helpers/dom/assertions'

test.describe('add field validation', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('cannot create a field with a reserved name', async ({memex}) => {
    const initialFieldCount = await memex.tableView.columns.getVisibleFieldCount()

    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName('reserved-column-name')

    await addField.expectSaveButtonToBeDisabled()
    await mustHaveDescription(addField.FIELD_NAME_INPUT, 'This field name is a reserved word')

    await memex.tableView.columns.expectVisibleFieldCount(initialFieldCount)
  })

  test('cannot create a field with an existing name', async ({memex}) => {
    const initialFieldCount = await memex.tableView.columns.getVisibleFieldCount()

    const fieldName = 'New text field'

    const {addField} = memex.tableView

    // first pass - create the new field
    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(fieldName)

    await addField.clickSaveButton()

    await memex.tableView.columns.expectVisibleFieldCount(initialFieldCount + 1)

    // second pass - create a new field with the same name
    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(fieldName)

    await addField.expectSaveButtonToBeDisabled()
    await mustHaveDescription(addField.FIELD_NAME_INPUT, 'This field name has already been taken')
  })
})
