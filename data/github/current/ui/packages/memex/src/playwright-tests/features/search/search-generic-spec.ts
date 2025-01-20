import {expect} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {expectColumnToBeHidden, expectGroupHasRowCount} from '../../helpers/table/assertions'
import {
  getColumnHeaderMenuOption,
  getColumnMenuTrigger,
  openColumnVisibilityMenu,
  sortByColumnName,
  toggleGroupBy,
} from '../../helpers/table/interactions'
import {getColumnVisibilityMenuOption} from '../../helpers/table/selectors'
import {eventually} from '../../helpers/utils'
import {TestsResources} from '../../types/resources'

const rowSelector = 'div[data-testid^=TableRow]'
const cellSelector = 'div[data-testid^=TableCell]'
const cardSelector = 'div[data-testid=board-view-column-card]'

test.describe('generic search', () => {
  test('it sets focuses on the search input for ctrl/cmd + /', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.filter.expectNotToBeFocused()
    await memex.filter.toggleFilter()
    await memex.filter.expectToBeFocused()
  })

  test('it does add a space when clicking outside the search input content', async ({memex}) => {
    const filterQuery = 'issue status:backlog'
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table', filterQuery: 'issue status:backlog'})

    await memex.APP_ROOT.click()
    await memex.filter.expectNotToBeFocused()

    await memex.filter.INPUT.click({position: {x: 200, y: 10}})
    await memex.filter.expectToHaveValue(`${filterQuery} `)
  })

  test('it does not add a space when clicking inside the search input content', async ({memex}) => {
    const filterQuery = 'issue status:backlog'
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table', filterQuery: 'issue status:backlog'})

    await memex.APP_ROOT.click()
    await memex.filter.expectNotToBeFocused()

    await memex.filter.INPUT.click({position: {x: 10, y: 10}})
    await memex.filter.expectToHaveValue(filterQuery)
  })

  test('it will not query hidden columns', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    const menuTrigger = await getColumnMenuTrigger(page, 'Labels')

    // Open the menu.
    await menuTrigger.click()
    const hideColumnOption = getColumnHeaderMenuOption(page, 'Labels', 'Hide field')
    await hideColumnOption.click()

    // Confirm that we've hidden the relevant column name.
    await eventually(() => expectColumnToBeHidden(page, 'Labels'))
    await memex.sharedInteractions.filterToExpectedCount('enhancement', rowSelector, 0)
  })

  test('it will not include redacted items in the result set', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('I', rowSelector, 6)
    const filteredRowTitles = await page.locator(rowSelector).allTextContents()

    // Redacted items are excluded no matter the query
    for (const title of filteredRowTitles) {
      expect(title).not.toContain(TestsResources.defaultRedactedItemTitle)
    }

    await memex.sharedInteractions.filterToExpectedCount('', rowSelector, 8)
    const refilteredRowTitles = await page.locator(rowSelector).allTextContents()

    // If the query is empty, Redacted items will be re-added to the set
    const redactedRow = refilteredRowTitles.find(title => title.indexOf(TestsResources.defaultRedactedItemTitle) > -1)

    expect(redactedRow).toBeDefined()
  })

  test('switching between Table and Board views keeps filtering', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('fix', rowSelector, 2)
    await memex.viewOptionsMenu.switchToBoardView()
    await waitForSelectorCount(page, cardSelector, 2)
    await memex.viewOptionsMenu.switchToTableView()
    await waitForSelectorCount(page, rowSelector, 2)
  })

  test('filtering in table re-ranks items in consecutive ascending order', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
    await memex.sharedInteractions.filterToExpectedCount('fix', rowSelector, 2)
    const rowOne = page.locator(rowSelector).nth(0)
    const indexOne = rowOne.locator('.draggable')
    await expect(indexOne).toHaveText('1', {useInnerText: true})
    const rowTwo = page.locator(rowSelector).nth(1)
    const indexTwo = rowTwo.locator('.draggable')
    await expect(indexTwo).toHaveText('2', {useInnerText: true})
  })
  test('filtering + grouping in table re-assigns ranks and hides filtered items', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
    // 'Fixes all the bugs' originally has rank '7'
    const row = page.locator(rowSelector).nth(6)
    await expect(row.locator('.draggable')).toHaveText('7', {useInnerText: true})
    await expect(row).toContainText(/Fixes all the bugs/)

    await toggleGroupBy(page, 'Status')
    await expectGroupHasRowCount(page, 'Backlog', 2)

    // 'Fixes all the bugs' is now ranked '2'
    const groupedRow = page.locator(rowSelector).nth(1)
    await expect(groupedRow.locator('.draggable')).toHaveText('2', {useInnerText: true})
    await expect(groupedRow).toContainText(/Fixes all the bugs/)

    await memex.sharedInteractions.filterToExpectedCount('bugs', rowSelector, 1)
    await expectGroupHasRowCount(page, 'Backlog', 1)

    // 'Fixes all the bugs' is now ranked '1'
    const groupedAndFilteredRow = page.locator(rowSelector).nth(0)
    await expect(groupedAndFilteredRow.locator('.draggable')).toHaveText('1', {useInnerText: true})
    await expect(groupedAndFilteredRow).toContainText(/Fixes all the bugs/)
  })
  test('filtering + sorting + grouping in table re-assigns ranks', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
    const rowIndex = 1
    const originalRow = page.locator(rowSelector).nth(rowIndex)
    const originalRank = originalRow.locator(cellSelector).nth(0)

    const expectedRank = '2'
    const expectedFilteredText = /issue/i
    await expect(originalRank).toHaveText(expectedRank, {useInnerText: true})
    await expect(originalRow).not.toContainText(expectedFilteredText)

    await memex.sharedInteractions.filterToExpectedCount('issue', rowSelector, 4)
    const filteredRow = page.locator(rowSelector).nth(rowIndex)
    const filteredRank = filteredRow.locator(cellSelector).nth(0)

    // Rank is updated according to the filtered set
    const expectedSortedText = /closed issue for testing/i
    await expect(filteredRank).toHaveText(expectedRank, {useInnerText: true})
    await expect(filteredRow).toContainText(expectedFilteredText)
    await expect(filteredRow).not.toContainText(expectedSortedText)

    // Sort by Title desc
    await sortByColumnName(page, 'Title', Resources.tableHeaderContextMenu.sortDescending)

    const sortedRow = page.locator(rowSelector).nth(rowIndex)
    const sortedRank = sortedRow.locator(cellSelector).nth(0)
    // Rank is updated according to the sorted set
    await expect(sortedRank).toHaveText(expectedRank, {useInnerText: true})
    await expect(filteredRow).toContainText(expectedSortedText)

    // Now group by status
    await toggleGroupBy(page, 'Status')
    await expectGroupHasRowCount(page, 'Backlog', 1)
    await expectGroupHasRowCount(page, 'Done', 2)

    const groupedFilteredSortedRow = page.locator(rowSelector).nth(rowIndex)
    const groupedFilteredSortedRank = groupedFilteredSortedRow.locator(cellSelector).nth(0)
    // Rank is updated according to the sorted group
    await expect(groupedFilteredSortedRank).toHaveText(expectedRank, {useInnerText: true})
    await expect(filteredRow).not.toContainText(expectedSortedText)
  })

  test('filter results constant after column is visibility toggled from hidden to visible', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    const rowsOnPage = page.locator(rowSelector)
    await expect(rowsOnPage).toHaveCount(8)

    await openColumnVisibilityMenu(page)

    // Toggle the Impact column to visible.
    await getColumnVisibilityMenuOption(page, 'Impact').click()
    await page.keyboard.press('Escape') // close column visibility menu

    await memex.sharedInteractions.filterToExpectedCount('impact:high', rowSelector, 1)
  })

  test('filter from suggestion after comma appends to list of options - keyboard', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    // Populate search with a partial query
    const filterString = 'status:Done,Back'

    await memex.filter.toggleFilter()
    await page.keyboard.type(filterString)

    // Wait for the suggestion option to appear
    await page.waitForSelector(_('search-suggestions-item-Backlog'))

    // The suggestion (Backlog) is provided with focus - press enter
    await page.keyboard.press('Enter')

    await memex.filter.expectToHaveValue('status:Done,Backlog')
    // 5 items should be visible based on this filter
    await waitForSelectorCount(page, rowSelector, 5)
  })

  test('filter from suggestion after comma appends to list of options - mouse', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    // Populate search with a partial query
    const filterString = 'status:Done,Back'
    await memex.filter.toggleFilter()
    await page.keyboard.type(filterString)

    // Wait for the suggestion option to appear
    await page.waitForSelector(_('search-suggestions-box'))

    // The suggestion (Backlog) appears - click this
    await page.click('[data-testid=search-suggestions-item-Backlog]')

    await memex.filter.expectToHaveValue('status:Done,Backlog')
    // 5 items should be visible based on this filter
    await waitForSelectorCount(page, rowSelector, 5)
  })

  test('filter from suggestion after comma appends to list of options (multiple filters) - keyboard', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    // Populate search with a partial query
    const filterString = 'stage:Closed status:Done,Back'
    await memex.filter.toggleFilter()
    await page.keyboard.type(filterString)

    // Wait for the suggestion option to appear
    await page.waitForSelector(_('search-suggestions-item-Backlog'))

    // The suggestion (Backlog) is provided with focus - press enter
    await page.keyboard.press('Enter')

    await memex.filter.expectToHaveValue('stage:Closed status:Done,Backlog')
    // 1 item should be visible based on this filter
    await waitForSelectorCount(page, rowSelector, 1)
  })
})
