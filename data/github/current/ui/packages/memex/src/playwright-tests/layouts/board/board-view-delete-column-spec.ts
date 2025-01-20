import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'

test.describe('Delete columns from board view', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })
  test('Deleting a column removes it from the board', async ({page, memex}) => {
    await memex.boardView.getColumn('Backlog').openContextMenu()
    await memex.boardView.COLUMN_MENU('Backlog').getByRole('menuitem', {name: 'Delete', exact: true}).click()

    await submitConfirmDialog(page, 'Delete')

    await memex.boardView.getColumn('Backlog').expectHidden()
  })
})
