import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe('Board sub-issues progress', () => {
  test('Renders card label for sub-issues progress', async ({page, memex}) => {
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

    await memex.boardView.getCard('In Progress', 0).expectSubIssuesProgressLabel('2 / 6')
  })

  test('Clicking on sub-issues progress filters the view', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {viewType: 'board'})

    await expect(memex.filter.INPUT).toHaveValue('')

    const card = memex.boardView.getCard('In Progress', 0)
    await card.cardLocator.getByRole('button', {name: 'Sub-issues progress'}).click()

    await expect(memex.filter.INPUT).toHaveValue('parent-issue:"github/memex#1176"')
  })
})
