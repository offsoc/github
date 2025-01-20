import {test} from '../../fixtures/test-extended'

test.describe('Table Reviewers Field', () => {
  test('Renders avatar for each reviewer', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.tableView.cells.getReviewersCell(0).expectReviewersCount(0)
    await memex.tableView.cells.getReviewersCell(1).expectReviewersCount(2)
  })
})
