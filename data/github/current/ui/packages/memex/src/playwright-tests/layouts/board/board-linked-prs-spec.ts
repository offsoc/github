import {test} from '../../fixtures/test-extended'

test.describe('Board Linked pull requests', () => {
  test('Renders card label for each pull request', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Needed so that the `Done` column on the board is rendered
    // and able to be inspected and asserted by the tests.
    // With a smaller viewport, this column is virtualized.
    await page.setViewportSize({
      width: 2000,
      height: 800,
    })

    await memex.boardView.getCard('Backlog', 1).expectLinkedPullRequestLabelCount(0)
    await memex.boardView.getCard('Done', 0).expectLinkedPullRequestLabelCount(1)
    await memex.boardView.getCard('Backlog', 0).expectLinkedPullRequestLabelCount(3)
  })
})
