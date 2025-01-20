import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {setCellToFocusMode} from '../../../helpers/table/interactions'
import {cellTestId} from '../../../helpers/table/selectors'

const fieldName = 'New field'

test.describe('form state', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('form state is preserved when clicking away', async ({page, memex}) => {
    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName(fieldName)
    await addField.setFieldType('iteration')

    await setCellToFocusMode(page, _(cellTestId(1, 'Title')))

    await addField.show()
    await addField.clickNewField()
    await addField.expectFieldName(fieldName)
    await addField.expectFieldType('Iteration')
  })

  test('form state is cleared when cancelled', async ({memex}) => {
    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()
    await addField.setFieldName(fieldName)
    await addField.setFieldType('iteration')

    await addField.clickCancelButton()

    await addField.show()
    await addField.clickNewField()
    await addField.expectFieldName('New Field 12')
    await addField.expectFieldType('Text')
  })
})
