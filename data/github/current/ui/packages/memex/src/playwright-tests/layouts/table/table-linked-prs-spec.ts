import {test} from '../../fixtures/test-extended'

test.describe('Table Linked pull requests', () => {
  test('Renders link for each pull request', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.tableView.cells.getLinkedPullRequestsCell(1).expectLinkedPullRequestLabelCount(0)
    await memex.tableView.cells.getLinkedPullRequestsCell(0).expectLinkedPullRequestLabelCount(1)
    await memex.tableView.cells.getLinkedPullRequestsCell(5).expectLinkedPullRequestLabelCount(3)
  })
})
