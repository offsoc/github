import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'
import {mustFind, waitForSelectorCount} from '../helpers/dom/assertions'
import {_} from '../helpers/dom/selectors'
import {toggleGroupBy} from '../helpers/table/interactions'

const NETWORKED_SEARCH_TIMEOUT = 30_000

test.describe('SidePanelBulkAdd', () => {
  test.describe('New Empty Memex', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()
      await memex.omnibar.discoverySuggestions.ADD_ITEM_SIDEPANEL.click()
      await expect(memex.sidePanel.BULK_ADD_SIDE_PANEL).toBeVisible()
    })

    test('Bulk adding creates new memex and adds items', async ({memex}) => {
      await expect(memex.sidePanel.BULK_ADD_BUTTON).toBeDisabled()
      await memex.sidePanel.SUGGESTED_ITEM.first().locator('input[type="checkbox"]').click()
      await expect(memex.sidePanel.SUGGESTED_ITEM.first().locator('input[type="checkbox"]')).toBeChecked()

      await expect(memex.sidePanel.BULK_ADD_BUTTON).toBeEnabled()
      await memex.sidePanel.BULK_ADD_BUTTON.click()
    })
  })

  test.describe('Not in Error Mode ', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')
      await memex.sidePanel.openBulkAddSidePanel()
    })

    test('Side Panel elements are visible', async ({page}) => {
      await expect(page.getByTestId('suggested-items-search-input')).toBeVisible()
      await waitForSelectorCount(page, _('repo-item'), 7)
      const button = page.getByTestId('repo-suggestions-button').getByText('memex')
      await expect(button).toBeVisible()
    })

    test('Clicking on the selector button opens the repo list', async ({page}) => {
      const button = page.getByTestId('repo-suggestions-button').getByText('memex')
      await expect(button).toBeVisible()
      await button.click()
      await expect(page.getByTestId('repo-picker-repo-list')).toBeVisible()
    })

    test('Clicking on one of the repos in the list closes the dropdown menu and updates the repo name on the button', async ({
      page,
      memex,
    }) => {
      const button = page.getByTestId('repo-suggestions-button').getByText('memex')
      await expect(button).toBeVisible()
      await button.click()
      await expect(page.getByTestId('repo-picker-repo-list')).toBeVisible()

      await page.getByRole('option', {name: 'github'}).click()
      await memex.stats.expectStatsToContain({
        memexProjectViewNumber: 1,
        name: 'bulk_add_side_panel_repo_switched',
        context: JSON.stringify({repo: 'github'}),
      })
      await expect(page.getByTestId('repo-picker-repo-list')).toBeHidden()
      await expect(page.getByTestId('repo-suggestions-button').getByText('github')).toBeVisible()
    })

    test('Bulk adding items removes then from suggested list', async ({memex}) => {
      await expect(memex.sidePanel.BULK_ADD_BUTTON).toBeDisabled()
      await memex.sidePanel.SUGGESTED_ITEM.first().locator('input[type="checkbox"]').click()
      await expect(memex.sidePanel.SUGGESTED_ITEM.first().locator('input[type="checkbox"]')).toBeChecked()

      await expect(memex.sidePanel.BULK_ADD_BUTTON).toBeEnabled()
      await memex.sidePanel.BULK_ADD_BUTTON.click()
    })

    test('Bulk adding all items shows empty suggested items view', async ({memex}) => {
      await expect(memex.sidePanel.BULK_ADD_BUTTON).toBeDisabled()
      await expect(memex.sidePanel.ITEMS_FOOTER).toHaveText(
        'Showing 7 most recent items that have not been added to this project. Use search to narrow down this list.',
      )

      for (let i = 0; i < 7; i++) {
        await memex.sidePanel.SUGGESTED_ITEM.nth(i).locator('input[type="checkbox"]').click()
        await expect(memex.sidePanel.SUGGESTED_ITEM.nth(i).locator('input[type="checkbox"]')).toBeChecked()
      }
      await expect(memex.sidePanel.BULK_ADD_BUTTON).toBeEnabled()
      await memex.sidePanel.BULK_ADD_BUTTON.click()
      await expect(memex.sidePanel.NO_SUGGESTED_ITEMS).toBeVisible({timeout: 10_000})
    })

    test('Checking select all checkbox selects all items', async ({memex}) => {
      await expect(memex.sidePanel.ALL_ITEMS_SELECTOR).toHaveText('Select all items')
      await memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT.click()
      await expect(memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT).toBeChecked()
      await expect(memex.sidePanel.ALL_ITEMS_SELECTOR).toHaveText('Deselect all items')

      for (let i = 0; i < 7; i++) {
        await expect(memex.sidePanel.SUGGESTED_ITEM.nth(i).locator('input[type="checkbox"]')).toBeChecked()
      }
    })

    test('Unchecking "select all" checkbox deselects all items', async ({memex}) => {
      await memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT.click()
      await memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT.click()

      await expect(memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT).not.toBeChecked()

      for (let i = 0; i < 7; i++) {
        await expect(memex.sidePanel.SUGGESTED_ITEM.nth(i).locator('input[type="checkbox"]')).not.toBeChecked()
      }
    })

    test('When all items are selected, unselecting an item deselects the "select all" checkbox', async ({memex}) => {
      for (let i = 0; i < 7; i++) {
        await memex.sidePanel.SUGGESTED_ITEM.nth(i).locator('input[type="checkbox"]').click()
      }

      await expect(memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT).toBeChecked()

      await memex.sidePanel.SUGGESTED_ITEM.nth(2).locator('input[type="checkbox"]').click()
      await expect(memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT).not.toBeChecked()
    })
  })

  test('Adding items from grouped table view will set the group by column', async ({page, memex}) => {
    const clickAddButtonAndAddItems = async <T>(omnibarLocator: string, json: T) => {
      const inProgressSection = await mustFind(page, _(omnibarLocator))
      const newItemButton = await mustFind(inProgressSection, _('new-item-button'))
      await newItemButton.click()

      await page.locator('text="Add item from repository"').click()
      await expect(memex.sidePanel.BULK_ADD_SIDE_PANEL).toBeVisible()
      for (let i = 0; i < 3; i++) {
        await memex.sidePanel.SUGGESTED_ITEM.nth(i).locator('input[type="checkbox"]').click()
      }

      const bulkAddButton = page.getByTestId('bulk-add-button')
      await Promise.all([
        page.waitForRequest(r => JSON.stringify(r.postDataJSON()) === JSON.stringify(json)),
        bulkAddButton.click(),
      ])
    }

    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
      groupedBy: {columnId: 'Status'},
    })

    // When grouped by status, the request should include the group by column
    await clickAddButtonAndAddItems('table-group-footer-Backlog', {
      memexProjectItem: {
        contentType: 'DraftIssue',
        content: {
          title: ' github/memex#1000, github/memex#1001, github/memex#1002',
        },
        memexProjectColumnValues: [
          {
            memexProjectColumnId: 'Status',
            value: '20e5d8ab',
          },
        ],
      },
    })

    // Close so we can ungroup
    await page.getByTestId('side-panel-button-close').click()
    await expect(memex.sidePanel.BULK_ADD_SIDE_PANEL).toBeHidden()

    // If we ungroup, the request should not include any value for the columns
    await toggleGroupBy(page, 'Status')
    await clickAddButtonAndAddItems('omnibar', {
      memexProjectItem: {
        contentType: 'DraftIssue',
        content: {
          title: ' github/memex#1000, github/memex#1001, github/memex#1002',
        },
        memexProjectColumnValues: [],
      },
    })
  })

  test.describe('Error handling', () => {
    test('shows error message when server fails to respond', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsInErrorMode')

      await memex.sidePanel.openBulkAddSidePanel()
      await memex.sidePanel.SUGGESTED_ITEM.first().locator('input[type="checkbox"]').click()
      await expect(memex.sidePanel.SUGGESTED_ITEM.first().locator('input[type="checkbox"]')).toBeChecked()
      const bulkAddButton = page.getByTestId('bulk-add-button')
      await expect(bulkAddButton).toBeEnabled()
      await bulkAddButton.click()

      // Assert that we displayed an error toast.
      await memex.toasts.expectErrorMessageVisible('Failed to add new items')
    })
  })

  test.describe('Empty states', () => {
    test('correct blank state when no repos', async ({memex}) => {
      await memex.navigateToStory('integrationTestNoSuggestedRepos')

      await memex.sidePanel.openBulkAddSidePanel()
      await expect(memex.sidePanel.NO_SUGGESTED_REPOS).toBeVisible()
    })

    test('correct blank state when no items in a repo', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestNoItemsInRepo')
      await memex.sidePanel.openBulkAddSidePanel()
      // navigating to the empty repo
      const button = page.getByTestId('repo-suggestions-button').getByText('memex')
      await expect(button).toBeVisible()
      await button.click()
      await expect(page.getByTestId('repo-picker-repo-list')).toBeVisible()
      await page.getByRole('option', {name: 'empty'}).click()

      await expect(memex.sidePanel.NO_SUGGESTED_ITEMS).toBeVisible()
    })
  })

  test.describe('Many items in a repo', () => {
    test('When there are 28 items in total, after adding 25 items side panel is refilled and the remaining 3 are displayed', async ({
      page,
      memex,
    }) => {
      await memex.navigateToStory('integrationTestsWithItems')
      await memex.sidePanel.openBulkAddSidePanel()

      // navigating to the repo with many items
      const button = page.getByTestId('repo-suggestions-button').getByText('memex')
      await expect(button).toBeVisible()
      await button.click()
      await expect(page.getByTestId('repo-picker-repo-list')).toBeVisible()
      await page.getByRole('option', {name: 'many-items'}).click()
      await expect(memex.sidePanel.ITEMS_RECENT_COUNT).toHaveText('Showing 25 most recent items')

      //  bulk adding the first 25 items
      await memex.sidePanel.ALL_ITEMS_SELECTOR_INPUT.click()
      await expect(memex.sidePanel.BULK_ADD_BUTTON).toBeEnabled()
      await memex.sidePanel.BULK_ADD_BUTTON.click()

      // expect that the rest of the items is shown
      await expect(memex.sidePanel.ITEMS_FOOTER).toHaveText(
        'Showing 3 most recent items that have not been added to this project. Use search to narrow down this list.',
        {timeout: 15_000},
      )
      await waitForSelectorCount(page, _('repo-item'), 3)
    })
  })

  test('If a repo is selected in the omnibar, it opens bulk add with this repo selected', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await page.keyboard.press('Control+Space')
    await expect(memex.omnibar.INPUT).toBeFocused()

    await page.keyboard.type('#')
    await page.waitForSelector(_('repo-searcher-list'))
    await waitForSelectorCount(page, _('repo-searcher-item'), 8, NETWORKED_SEARCH_TIMEOUT)

    // Filter the list of repository suggestions.
    await page.keyboard.type('private')
    await waitForSelectorCount(page, _('repo-searcher-item'), 1)
    // Select a repository.
    await page.keyboard.press('Enter')

    await memex.omnibar.issuePicker.BULK_ADD_ITEM.click()
    await expect(memex.sidePanel.BULK_ADD_SIDE_PANEL).toBeVisible()

    await expect(page.getByTestId('suggested-items-search-input')).toBeVisible()
    await waitForSelectorCount(page, _('repo-item'), 7)
    const button = page.getByTestId('repo-suggestions-button').getByText('private-server')
    await expect(button).toBeVisible()
  })
})
