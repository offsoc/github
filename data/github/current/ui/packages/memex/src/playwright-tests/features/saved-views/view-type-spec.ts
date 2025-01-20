import {test} from '../../fixtures/test-extended'

test.describe('View type switching', () => {
  test('can switch from table to board', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.viewOptionsMenu.switchToBoardView()
    await memex.boardView.expectVisible()
    memex.expectQueryParams([{name: 'layout', expectedValue: 'board'}])

    await memex.viewOptionsMenu.switchToTableView()

    await memex.tableView.expectVisible()
    // no param because it's the initial state
    memex.expectQueryParams([{name: 'layout', expectedValue: null}])
  })

  test('prefers URL param over default', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    // Use the menu to update the URL and localStorage to "board"
    await memex.viewOptionsMenu.switchToBoardView()
    await memex.boardView.expectVisible()

    // since we fail a test that normally makes multiple calls to
    // navigateToStory(), we work around this by first resetting to `about:blank`
    // which tricks navigateToStory() into thinking this is the first navigation for this test
    await page.goto('about:blank')

    // Visit the URL again, but use the "table" URL param
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    await memex.tableView.expectVisible()
  })
  test('can switch from table to board while in readonly mode', async ({memex}) => {
    await memex.navigateToStory('integrationTestsInReadonlyMode')

    await memex.viewOptionsMenu.switchToBoardView()
    await memex.boardView.expectVisible()
    memex.expectQueryParams([{name: 'layout', expectedValue: 'board'}])

    await memex.viewOptionsMenu.switchToTableView()

    await memex.tableView.expectVisible()
    // no param because it's the initial state
    memex.expectQueryParams([{name: 'layout', expectedValue: null}])
  })
})
