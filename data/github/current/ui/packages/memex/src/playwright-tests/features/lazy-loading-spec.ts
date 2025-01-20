import {test} from '../fixtures/test-extended'

test.describe('Lazy-loading item data', () => {
  test('loads column data when loading the view', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithPartialData')

    //For issue
    await memex.tableView.cells.getGenericCell(0, 'Assignees').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Status').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Labels').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Linked pull requests').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Repository').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Milestone').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Reviewers').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Custom Text').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Due Date').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Aardvarks').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Estimate').expectLoading()
    await memex.tableView.cells.getGenericCell(0, 'Iteration').expectLoading()

    //For draft issue
    await memex.tableView.cells.getGenericCell(1, 'Assignees').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Status').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Labels').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Linked pull requests').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Repository').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Milestone').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Reviewers').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Custom Text').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Due Date').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Aardvarks').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Estimate').expectLoading()
    await memex.tableView.cells.getGenericCell(1, 'Iteration').expectLoading()

    //For issue
    await memex.tableView.cells.getGenericCell(0, 'Assignees').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Status').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Labels').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Linked pull requests').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Repository').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Milestone').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Reviewers').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Custom Text').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Due Date').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Aardvarks').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Estimate').expectLoaded()
    await memex.tableView.cells.getGenericCell(0, 'Iteration').expectLoaded()

    //For draft issue
    await memex.tableView.cells.getGenericCell(1, 'Assignees').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Status').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Labels').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Linked pull requests').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Repository').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Milestone').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Reviewers').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Custom Text').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Due Date').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Aardvarks').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Estimate').expectLoaded()
    await memex.tableView.cells.getGenericCell(1, 'Iteration').expectLoaded()
  })

  for (const viewType of ['table', 'board'] as const) {
    test(`${viewType} view displays the loading state when the filter requires lazy loading`, async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithPartialData', {
        filterQuery: 'no:assignee',
        viewType,
      })

      await test.expect(page.getByTestId('view-loading-indicator').nth(0)).toBeVisible()
      await test.expect(page.getByTestId('view-loading-indicator').nth(0)).toBeHidden()
    })
  }
})
