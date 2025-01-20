import {expect} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {tomorrowISOString} from '../../helpers/dates'
import {mustFind, mustNotFind, waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {expectColumnToBeHidden} from '../../helpers/table/assertions'
import {getColumnHeaderMenuOption, getColumnMenuTrigger} from '../../helpers/table/interactions'
import {testPlatformMeta} from '../../helpers/utils'
import {BacklogColumn, MissingStatusColumn} from '../../types/board'
import {TestsResources} from '../../types/resources'
import type {ViewType} from '../../types/view-type'

const rowSelector = 'div[data-testid^=TableRow]'
const cardSelector = 'div[data-testid=board-view-column-card]'
const EXTENDED_TIMEOUT = 6000
const OPEN_FILTER_BAR_KEYS = `${testPlatformMeta}+/`

test.describe('Search', () => {
  test.describe('cross-view tests', () => {
    const testCases = new Array<{view: ViewType; itemSelector: string}>(
      {
        view: 'table',
        itemSelector: rowSelector,
      },
      {
        view: 'board',
        itemSelector: cardSelector,
      },
    )

    for (const testCase of testCases) {
      test.describe(`in ${testCase.view}`, () => {
        test.beforeEach(async ({page, memex}) => {
          await memex.navigateToStory('integrationTestsWithItems', {viewType: testCase.view})
          await waitForSelectorCount(page, testCase.itemSelector, 8)
        })

        test('it allows filtering by title', async ({memex}) => {
          await memex.sharedInteractions.filterToExpectedCount('fixes', testCase.itemSelector, 1)
          await memex.sharedInteractions.filterToExpectedCount('fix', testCase.itemSelector, 2)
        })

        test('filtering is case-insensitive', async ({memex}) => {
          await memex.sharedInteractions.filterToExpectedCount('FiX', testCase.itemSelector, 2)
        })

        test('it hides all items when filtering does not match', async ({memex}) => {
          await memex.sharedInteractions.filterToExpectedCount('very long text 123#$', testCase.itemSelector, 0)
        })

        test('it filters draft items', async ({memex}) => {
          await memex.sharedInteractions.filterToExpectedCount('draft', 'text=/Here/', 1)
        })
      })
    }
  })

  test('it sets filter query in URL params', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('fixES', rowSelector, 1)
    await page.waitForURL(url => url.searchParams.get('filterQuery') === 'fixES')

    await memex.sharedInteractions.filterToExpectedCount('fix', rowSelector, 2)
    await page.waitForURL(url => url.searchParams.get('filterQuery') === 'fix')

    await memex.sharedInteractions.filterToExpectedCount('', rowSelector, 8)
    await page.waitForURL(url => url.searchParams.get('filterQuery') === null)
  })

  test('it escapes special characters in filter query', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('search !@#$%^&*(). this', rowSelector, 0)
    await page.waitForURL(url => url.search.includes('search+%21%40%23%24%25%5E%26*%28%29.+this'))
  })

  test('it searches by values of any visible column', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('enhancement', rowSelector, 3)
  })

  test('it shows results count in views', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('fix', rowSelector, 2)

    let resultsCountElement = await mustFind(page, _('filter-results-count'))
    expect(await resultsCountElement.textContent()).toEqual('2')

    await memex.sharedInteractions.filterToExpectedCount('bugs', rowSelector, 1)

    resultsCountElement = await mustFind(page, _('filter-results-count'))
    expect(await resultsCountElement.textContent()).toEqual('1')
  })

  test.describe('it shows results count in workflows', () => {
    test('workflow editor', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestWorkflowsPage', {
        testIdToAwait: 'automation-page',
      })

      const autoArchiveListItem = await mustFind(page, _('workflow-nav-item-query_matched_archive_project_item'))
      await autoArchiveListItem.click()

      const disabledResultsCountElement = page.getByTestId('disabled-filter-results-count')
      await expect(disabledResultsCountElement).toHaveText('3')

      await page.getByTestId('workflow-edit-button').click()
      await memex.filter.filterBy('is:issue')

      const resultsCountElement = page.getByTestId('filter-results-count')
      await expect(resultsCountElement).toHaveText('5')
    })
  })

  test.describe('it shows notification when the filter matches a time bound field', () => {
    test('workflow editor', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestWorkflowsPage', {
        testIdToAwait: 'automation-page',
      })

      const autoArchiveListItem = await mustFind(page, _('workflow-nav-item-query_matched_archive_project_item'))
      await autoArchiveListItem.click()

      await page.getByTestId('workflow-edit-button').click()
      await memex.filter.INPUT.click()

      await mustNotFind(page, _('time-bound-notification'))
      await memex.filter.INPUT.type(' last-updated:14days')

      await mustFind(page, _('time-bound-notification'))
    })
  })

  test('user input is not changed', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('   STaTuS:BackLog   ', rowSelector, 2)

    await memex.filter.expectToHaveValue('   STaTuS:BackLog   ')

    await page.waitForTimeout(500) // wait of de-bounce
    // Input field should not change to normalized value
    await memex.filter.expectToHaveValue('   STaTuS:BackLog   ')
  })

  test('with the updated query parser support partial matches in quotes and containing a colon', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    await memex.omnibar.INPUT.focus()
    await page.keyboard.insertText('"no:review required')
    await page.keyboard.press('Enter')

    await memex.filter.toggleFilter()
    await expect(memex.filter.INPUT).toBeFocused()
    await page.keyboard.insertText('"no:review"')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {
      timeout: EXTENDED_TIMEOUT,
    })
    expect(await resultsCountElement.textContent()).toEqual('1')
  })

  test.describe('empty value column filtering', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    })

    test('it allows filtering by empty column value', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('no:status', rowSelector, 2)
    })

    test('it allows filtering by multiple empty column values', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('no:status,labels', rowSelector, 4)
    })

    test('it allows for narrowing queries for empty column values by using separate filters', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('no:label no:assignee', rowSelector, 3)
    })

    test('it allows for narrowing queries for empty column values for multi-word columns', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('no:"due date"', rowSelector, 4)
    })
  })

  test.describe('filtering by type or state', () => {
    // DefaultDraftPullRequest
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    })

    test('it filters items by type', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('is:issue', rowSelector, 5)
      await memex.sharedInteractions.filterToExpectedCount('is:pr', rowSelector, 2)
    })

    test('it filters items by state', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('is:open', rowSelector, 4)
      await memex.sharedInteractions.filterToExpectedCount('is:closed', rowSelector, 3)
      await memex.sharedInteractions.filterToExpectedCount('is:draft', rowSelector, 3)
    })

    test('it filters items by last-updated', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('last-updated:7days', rowSelector, 6)
      await memex.sharedInteractions.filterToExpectedCount('-last-updated:7days', rowSelector, 1)
    })

    test('it composes state and type', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('is:pr,draft', rowSelector, 4)
      // a closed draft pull request is not displayed as a draft in the project page
      await memex.sharedInteractions.filterToExpectedCount('is:pr is:draft', rowSelector, 0)
    })

    test('it composes type filter with other filters', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('status:Done is:issue is:closed', rowSelector, 2)
      await memex.sharedInteractions.filterToExpectedCount('is:draft no:assignee', rowSelector, 2)
    })
  })

  test.describe('single column filtering', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    })

    test('it allows filtering by a single column value', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('closed', rowSelector, 3)
      await memex.sharedInteractions.filterToExpectedCount('stage:closed', rowSelector, 1)
    })

    test('filtering is case-insensitive', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('STaTuS:BackLog', rowSelector, 2)
    })

    test('resets results when empty filter is detected', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('assignees', rowSelector, 0)
      await memex.sharedInteractions.filterToExpectedCount('assignees:', rowSelector, 7)
    })

    test('filter search term can be wrapped in double quotes if more than one word', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('labels:"tech debt"', rowSelector, 1)
    })

    test('filter search term can be wrapped in single quotes if more than one word', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount(`labels:'tech debt'`, rowSelector, 1)
    })

    test('if quotes are malformed, returns no results', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount(`labels:"tech debt`, rowSelector, 0)
    })

    test('if column name is more than one word, it must be hyphenated to return results', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount(`due-date:${tomorrowISOString}`, rowSelector, 1)
    })
  })

  test.describe('multiple column filtering', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    })

    test('it allows filtering by applying muliple column filters simultaneously', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount(
        'status:done,backlog team:"novelty aardvarks", labels:"tech debt"',
        rowSelector,
        1,
      )
    })

    test('it allows filtering for multiple items in a single column by using a comma in same filter', async ({
      memex,
    }) => {
      await memex.sharedInteractions.filterToExpectedCount('labels:"enhancement ✨","tech debt"', rowSelector, 3)
    })

    test('it allows filtering for narrowing queries in a single column by using separate filters', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('labels:"enhancement ✨" labels:"tech debt"', rowSelector, 1)
    })

    test('it allows filtering by free text and column filters simultaneously', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('fix status:backlog labels:"enhancement ✨"', rowSelector, 1)
      await memex.sharedInteractions.filterToExpectedCount('fix -no:labels', rowSelector, 1)
      await memex.sharedInteractions.filterToExpectedCount('-status:done fix -is:issue', rowSelector, 1)
    })

    test('it returns free text search results only if column filter is present with no value', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('status: update styles', rowSelector, 1)
    })
  })

  test.describe('create filter column menu option', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    })

    test('it adds filter to empty search input', async ({page, memex}) => {
      const menuTrigger = await getColumnMenuTrigger(page, 'Due Date')
      await menuTrigger.click()

      const createFilterOption = getColumnHeaderMenuOption(
        page,
        'Due Date',
        Resources.tableHeaderContextMenu.filterValues,
      )
      await createFilterOption.click()

      // 7 items should be visible and search input is focused & updated with column filter
      await waitForSelectorCount(page, rowSelector, 7)
      await memex.filter.expectToBeFocused()
      await memex.filter.expectToHaveValue('due-date:')
    })

    test('it appends filter to existing search', async ({page, memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('issue status:done,backlog', rowSelector, 3)

      const menuTrigger = await getColumnMenuTrigger(page, 'Repository')
      await menuTrigger.click()

      const createFilterOption = getColumnHeaderMenuOption(
        page,
        'Repository',
        Resources.tableHeaderContextMenu.filterValues,
      )
      await createFilterOption.click()

      // 3 items should be visible and search input is focused & updated with column filter
      await waitForSelectorCount(page, rowSelector, 3)
      await memex.filter.expectToBeFocused()
      await memex.filter.expectToHaveValue('issue status:done,backlog repo:')
    })

    const emptyFilters = {
      'empty filter': 'status:',
      'empty filter with emoji': '✨-status:',
      'empty filter with special characters': '$tatu$:',
    }

    for (const [filterLabel, filterValue] of Object.entries(emptyFilters)) {
      test(`it replaces ${filterLabel} if present`, async ({page, memex}) => {
        await memex.sharedInteractions.filterToExpectedCount(`issue ${filterValue}`, rowSelector, 4)
        await page.keyboard.press('Escape')

        const menuTrigger = await getColumnMenuTrigger(page, 'Assignees')
        await menuTrigger.click()

        const createFilterOption = getColumnHeaderMenuOption(
          page,
          'Assignees',
          Resources.tableHeaderContextMenu.filterValues,
        )
        await createFilterOption.click()

        // 4 items should be visible and search input is focused & updated with column filter
        await waitForSelectorCount(page, rowSelector, 4)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('issue assignee:')
      })
    }
  })

  test('when search input is blurred, omnibar is focused in an EMPTY board view', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty', {
      viewType: 'board',
    })

    /** click to close templat dialog */
    await page.getByRole('button', {name: 'Close'}).click()
    await expect(memex.filter.INPUT).not.toBeFocused()

    await memex.boardView.getColumn(BacklogColumn.Label).clickAddItem()
    await expect(memex.omnibar.INPUT).toBeFocused()
  })

  test('when search input is blurred, previously focused item is refocused', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.getCard(MissingStatusColumn.Label, 0).focus()

    // initialize the search input using the keyboard shortcut
    await memex.filter.toggleFilter()
    await expect(memex.filter.INPUT).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(memex.filter.INPUT).not.toBeFocused()

    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectToBeFocused()
  })

  test.describe('assignees column visibility does not affect filtering in board view', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    })

    test('when assignees column is hidden in table view, it is still filterable in board view and table view', async ({
      page,
      memex,
    }) => {
      const menuTrigger = await getColumnMenuTrigger(page, 'Assignees')
      await menuTrigger.click()
      const hideColumnOption = getColumnHeaderMenuOption(page, 'Assignees', 'Hide field')
      await hideColumnOption.click()

      // Confirm that we've hidden the relevant column name.
      await expectColumnToBeHidden(page, 'Assignees')

      await memex.sharedInteractions.filterToExpectedCount('assignee:traumverloren fix this issue', rowSelector, 1)
      await memex.viewOptionsMenu.switchToBoardView()
      await waitForSelectorCount(page, cardSelector, 1)
      await memex.viewOptionsMenu.switchToTableView()
      await waitForSelectorCount(page, rowSelector, 1)
    })
  })

  test.describe('Search filtering toasts', () => {
    test('a warning toast is displayed if a new item does not match the current filter', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      await memex.sharedInteractions.filterToExpectedCount('xxx', rowSelector, 0)

      const itemInput = page.getByTestId('repo-searcher-input')
      await itemInput.type('yyy')
      await itemInput.press('Enter')

      await memex.toasts.expectErrorMessageVisible(TestsResources.newItemFilterWarning)
    })
  })

  test.describe('search table view via keyboard shortcut', () => {
    test('search should remain empty when engaged from keyboard shortcut', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await mustNotFind(page, _('search-suggestions-box'))
      await expect(memex.filter.INPUT).toHaveValue('')
    })

    test('search should inject a space when it contains text', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
        filterQuery: 'test',
      })

      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await mustNotFind(page, _('search-suggestions-box'))
      await expect(memex.filter.INPUT).toHaveValue('test ')
    })

    test('search should not inject a space when it ends with :', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
        filterQuery: 'assignee:',
      })

      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await expect(page.getByTestId('search-suggestions-box')).toBeVisible()
      await expect(memex.filter.INPUT).toHaveValue('assignee:')
    })
  })

  test.describe(`search board view via keyboard shortcut`, () => {
    test('search should remain empty when engaged from keyboard shortcut', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
      })
      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)

      await mustNotFind(page, _('search-suggestions-box'))
      await expect(memex.filter.INPUT).toHaveValue('')
    })

    test('search should inject a space when it contains text', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
        filterQuery: 'test',
      })

      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await expect(memex.filter.INPUT).toHaveValue('test ')
    })

    test('search should not inject a space when it ends with :', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
      })

      await memex.filter.INPUT.fill('assignee:')
      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await expect(page.getByTestId('search-suggestions-box')).toBeVisible()
      await expect(memex.filter.INPUT).toHaveValue('assignee:')
    })
  })

  test.describe(`View Save and Reset`, () => {
    test('should show disabled buttons when in clean state', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })
      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await mustFind(page, _('filter-state-actions'))
      await expect(memex.filter.RESET_CHANGES).toBeDisabled()
      await expect(memex.filter.SAVE_CHANGES).toBeDisabled()
    })
    test('should show buttons when in dirty state', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })
      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await memex.filter.INPUT.fill("I'm Dirty Now")
      await expect(page.getByTestId('filter-state-actions')).toBeVisible()
      await mustFind(page, _('filter-state-actions'))
      await expect(memex.filter.RESET_CHANGES).toBeEnabled()
      await expect(memex.filter.SAVE_CHANGES).toBeEnabled()
    })

    test("should not show Save button when user doesn't have write permissions", async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsInReadonlyMode', {
        viewType: 'table',
      })
      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await memex.filter.INPUT.fill("I'm Dirty Now")

      await expect(memex.filter.RESET_CHANGES).toBeEnabled()
      await expect(memex.filter.SAVE_CHANGES).toBeHidden()
    })

    test('should revert filter when in dirty state', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })
      await page.keyboard.press(OPEN_FILTER_BAR_KEYS)
      await memex.filter.INPUT.fill("I'm Dirty Now")

      await expect(memex.filter.RESET_CHANGES).toBeEnabled()
      await memex.filter.RESET_CHANGES.click()
      await expect(memex.filter.INPUT).toHaveValue('')
    })
  })
})
