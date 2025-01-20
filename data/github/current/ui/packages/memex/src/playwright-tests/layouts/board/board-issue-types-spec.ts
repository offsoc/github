import {test} from '../../fixtures/test-extended'

test.describe('Board Issue Types', () => {
  test('Renders card label for issue types', async ({page, memex}) => {
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

    await memex.boardView.getCard('Backlog', 0).expectIssueTypeLabel('Bug')
  })
})
