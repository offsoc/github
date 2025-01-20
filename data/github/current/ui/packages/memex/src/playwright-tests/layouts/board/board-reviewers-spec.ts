import {test} from '../../fixtures/test-extended'

test.describe('Board Reviewers', () => {
  test('Renders card label for reviewers', async ({page, memex}) => {
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

    await memex.boardView.getCard('Backlog', 1).expectReviewerLabelCount(0)
    await memex.boardView.getCard('Done', 1).expectReviewerLabelCount(1)
    await memex.boardView.getCard('Done', 1).getReviewersLabel().expectReviewersCount(2)
  })
})
