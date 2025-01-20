import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe('Table Sub-issues Progress', () => {
  test('Renders column data for sub-issues progress', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues')
    await memex.tableView.cells.getSubIssuesProgressCell(0).expectText(/2 \/ 6.*/)
  })

  test('Clicking on sub-issues progress filters on the parent issue', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues')
    const subIssuesProgressCell = memex.tableView.cells.getSubIssuesProgressCell(0)
    await subIssuesProgressCell.locator
      .getByRole('button', {
        name: 'Sub-issues progress: 2 of 6 (33%). Show sub-issues for: Produce ag-Grid staging demo',
      })
      .click()
    await expect(memex.filter.INPUT).toHaveValue(`parent-issue:"github/memex#1176"`)
  })
})
