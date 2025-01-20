import {test} from '../../../fixtures/test-extended'

test.describe('field creation failure', () => {
  test('results in an error being displayed', async ({memex}) => {
    await memex.navigateToStory('integrationTestsInErrorMode')

    const initialFieldCount = await memex.tableView.columns.getVisibleFieldCount()

    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName('New Column (will error)')

    await addField.clickSaveButton()

    await memex.toasts.expectErrorMessageVisible('Failed to create column')

    await memex.tableView.columns.expectVisibleFieldCount(initialFieldCount)
  })
})
