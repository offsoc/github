import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe('Board parent issues', () => {
  test('Renders card label for each parent issue', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      viewType: 'board',
    })

    // Needed so that the `Done` column on the board is rendered
    // and able to be inspected and asserted by the tests.
    // With a smaller viewport, this column is virtualized.
    await page.setViewportSize({
      width: 2000,
      height: 800,
    })

    await memex.boardView.getCard('In Progress', 0).expectParentIssueLabel('Parent One #10')
  })

  test('Clicking on parent issue token filters the view', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {viewType: 'board'})

    await expect(memex.filter.INPUT).toHaveValue('')

    const card = memex.boardView.getCard('In Progress', 0)
    await card.cardLocator.getByRole('button', {name: /Parent One #10/}).click()

    await expect(memex.filter.INPUT).toHaveValue('parent-issue:"github/sriracha-4#10"')
  })
})
