import {expect, type Locator, type Page} from '@playwright/test'

import type {MemexApp, NavigateToStoryOptions} from '../fixtures/memex-app'
import {test} from '../fixtures/test-extended'
import {waitForSelectorCount} from '../helpers/dom/assertions'
import {_} from '../helpers/dom/selectors'
import {getRowCountInTable, getTableRow, getTableRowIndex, getTitleTextParts} from '../helpers/table/selectors'

const RepositoryItemSelector = _('repo-searcher-item')
const IssueItemSelector = _('issue-picker-item')
const AddMultipleItemsSelector = _('add-multiple-items')
const BulkAddViewSelector = _('bulk-add-view')

// Use a slightly longer timeout for tests that use APIs that simulate network latency.
const NETWORKED_SEARCH_TIMEOUT = 30_000

test.describe('Omnibar search', () => {
  test.describe('repository search', () => {
    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')
      await page.keyboard.press('Control+Space')
      await expect(memex.omnibar.INPUT).toBeFocused()

      await page.keyboard.type('#')
      await page.waitForSelector(_('repo-searcher-list'))
      await waitForSelectorCount(page, RepositoryItemSelector, 8, NETWORKED_SEARCH_TIMEOUT)
    })

    test('can select suggested repository with mouse', async ({memex}) => {
      await memex.omnibar.repositoryList.getRepositoryListItemLocator(1).click()

      await expect(memex.omnibar.SELECTED_REPOSITORY).toContainText('repo:github')
    })

    test('can select suggested repository with keyboard', async ({page, memex}) => {
      // check first item is selected
      await expect(memex.omnibar.repositoryList.getRepositoryListItemLocator(0)).toHaveAttribute(
        'aria-selected',
        'true',
      )

      // move to third option in list
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')

      // check third item is selected
      await expect(memex.omnibar.repositoryList.getRepositoryListItemLocator(2)).toHaveAttribute(
        'aria-selected',
        'true',
      )

      await page.keyboard.press('Enter')

      await expect(memex.omnibar.SELECTED_REPOSITORY).toContainText('repo:rails')
    })

    test('hides suggested repository after selection', async ({memex}) => {
      await memex.omnibar.repositoryList.getRepositoryListItemLocator(1).click()

      await expect(memex.omnibar.repositoryList.REPOSITORY_LIST).toBeHidden()
    })

    test('backspace after selection clears the selected repository', async ({page, memex}) => {
      await memex.omnibar.repositoryList.getRepositoryListItemLocator(1).click()

      await expect(memex.omnibar.repositoryList.REPOSITORY_LIST).toBeHidden()

      await page.keyboard.press('Backspace')

      await expect(memex.omnibar.SELECTED_REPOSITORY).toBeHidden()
    })
  })

  test.describe('improved issue search', () => {
    test('updates search results in response to a query', async ({page, memex}) => {
      test.fixme(
        process.env.MATRIX_OS === 'windows-latest',
        "Not sure why this isn't resolving, but the behavior works in windows",
      )
      await setupImprovedIssueSearchTest(page, memex)

      await page.keyboard.type('closed')
      await waitForSelectorCount(page, IssueItemSelector, 3, NETWORKED_SEARCH_TIMEOUT)
    })
  })

  const setupImprovedIssueSearchTest = async (page: Page, memex: MemexApp, options?: NavigateToStoryOptions) => {
    await memex.navigateToStory('integrationTestsWithItems', options)
    await page.keyboard.press('Control+Space')
    await expect(memex.omnibar.INPUT).toBeFocused()

    await page.keyboard.type('#')

    await waitForSelectorCount(page, RepositoryItemSelector, 8, NETWORKED_SEARCH_TIMEOUT)

    await memex.omnibar.repositoryList.getRepositoryListItemLocator(0).click()
  }

  test.describe('improved issue search', () => {
    test.beforeEach(async ({page, memex}) => {
      await setupImprovedIssueSearchTest(page, memex)
    })

    test('shows suggested issues after choosing repository', async ({page}) => {
      await waitForSelectorCount(page, IssueItemSelector, 7, NETWORKED_SEARCH_TIMEOUT)
    })

    test("shows zero results for query that doesn't match any items", async ({page}) => {
      await page.keyboard.insertText('!')

      await waitForSelectorCount(page, IssueItemSelector, 0, NETWORKED_SEARCH_TIMEOUT)
    })

    test('allows a user to add an issue to the table with the mouse', async ({page, memex}) => {
      const initialRowCount = await getRowCountInTable(page)

      await waitForSelectorCount(page, IssueItemSelector, 7, NETWORKED_SEARCH_TIMEOUT)
      const title = await memex.omnibar.issuePicker.getIssuePickerItemTitle(1)
      await memex.omnibar.issuePicker.getIssuePickerItemLocator(1).click()
      await page.waitForSelector(`text=${title}`)

      const newRowCount = await getRowCountInTable(page)
      expect(newRowCount).toEqual(initialRowCount + 1)

      const newRow = await getTableRow(page, newRowCount)
      const titleCellTextParts = await getTitleTextParts(page, await getTableRowIndex(newRow))
      expect(titleCellTextParts.name).toEqual(title)

      // The search dropdown should remain open after the addition, and there should be one less
      // result than previously because the newly added item should have been removed.
      await waitForSelectorCount(page, IssueItemSelector, 7, NETWORKED_SEARCH_TIMEOUT)
    })

    test('allows a user to add an issue to the table with the keyboard', async ({page, memex}) => {
      const initialRowCount = await getRowCountInTable(page)

      await waitForSelectorCount(page, IssueItemSelector, 7, NETWORKED_SEARCH_TIMEOUT)

      // check first item is selected
      await expect(memex.omnibar.issuePicker.getIssuePickerItemLocator(0)).toHaveAttribute('aria-selected', 'true')

      // move to third option in list
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')

      // check third item is selected
      await expect(memex.omnibar.issuePicker.getIssuePickerItemLocator(2)).toHaveAttribute('aria-selected', 'true')

      const itemTitle = await memex.omnibar.issuePicker.getIssuePickerItemTitle(2)

      await page.keyboard.press('Enter')
      await page.waitForSelector(`text=${itemTitle}`)
      const newRowCount = await getRowCountInTable(page)
      expect(newRowCount).toEqual(initialRowCount + 1)

      const lastRow = await getTableRow(page, newRowCount)
      const titleCellTextParts = await getTitleTextParts(page, await getTableRowIndex(lastRow))
      expect(titleCellTextParts.name).toEqual(itemTitle)

      // Omnibar is still focused
      await page.waitForFunction(() => {
        return document.activeElement?.getAttribute('data-testid') === 'repo-searcher-input'
      })

      // The search dropdown should remain open after the addition, and there should be one less
      // result than previously because the newly added item should have been removed.
      await waitForSelectorCount(page, IssueItemSelector, 7, NETWORKED_SEARCH_TIMEOUT)
    })
  })

  test.describe('bulk add', () => {
    test.beforeEach(async ({page, memex}) => {
      await setupImprovedIssueSearchTest(page, memex)
    })
    test('shows add multiple items option', async ({page}) => {
      await waitForSelectorCount(page, AddMultipleItemsSelector, 1, NETWORKED_SEARCH_TIMEOUT)
    })

    test('clicking on add multiple items opens the side bar', async ({page, memex}) => {
      await memex.omnibar.issuePicker.BULK_ADD_ITEM.click()
      await waitForSelectorCount(page, BulkAddViewSelector, 1, NETWORKED_SEARCH_TIMEOUT)
    })
  })

  test.describe('smaller viewports', () => {
    test.use({viewport: {width: 320, height: 256}})

    async function assertPositionLeftPositive(locator: Locator) {
      const positionLeft = await locator.evaluate(element => element.style.left)
      expect(parseInt(positionLeft)).toBeGreaterThan(0)
    }

    test('search menus are visible at smaller viewports', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      // Open the discovery suggestions
      await memex.omnibar.NEW_ITEM.click()
      await expect(memex.omnibar.discoverySuggestions.LIST).toBeVisible()

      // Assert discovery suggestions left position is positive
      await assertPositionLeftPositive(memex.omnibar.discoverySuggestions.LIST)

      // Open the repository suggestions
      await expect(memex.omnibar.INPUT).toBeFocused()
      await page.keyboard.type('#')
      const repoSearcher = page.getByTestId('repo-searcher-list')

      // Assert repo searcher left position is positive
      await assertPositionLeftPositive(repoSearcher)

      // Select a repository
      await memex.omnibar.repositoryList.getRepositoryListItemLocator(1).click()

      // Assert issue picker left position is positive
      const issueSelector = page.getByTestId('issue-picker-list')
      await assertPositionLeftPositive(issueSelector)
    })
  })
})
