import {test} from '../../fixtures/test-extended'

test.describe('Table Issue Types', () => {
  test('Renders column data for issue types', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.tableView.cells.getIssueTypeCell(3).expectText('Batch')
    await memex.tableView.cells.getIssueTypeCell(5).expectText('Bug')
  })
})
