import {test} from '../../fixtures/test-extended'

test.describe('Table Parent Issues', () => {
  test('Renders column data for parent issues', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues')

    await memex.tableView.cells.getParentIssueCell(0).expectText('Parent One #10')
    await memex.tableView.cells.getParentIssueCell(1).expectText('Parent Two #11')
    await memex.tableView.cells.getParentIssueCell(3).expectText('Parent Three #12')
  })
})
