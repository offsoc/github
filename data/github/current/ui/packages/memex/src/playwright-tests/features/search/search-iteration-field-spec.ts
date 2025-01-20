import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by iteration field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'table'})
  })

  test('shows correct number of items when filtering is done based on iteration values', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('Iteration:"Iteration 4"', rowSelector, 3)
    await memex.sharedInteractions.filterToExpectedCount('Iteration:"Iteration 5"', rowSelector, 1)
  })

  test('shows correct number of items when filtering is done using iteration @current filter', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('Iteration:@current', rowSelector, 3)
  })

  test('shows correct number of items when filtering on multiple iteration values', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('Iteration:"Iteration 4",@next', rowSelector, 4)
  })

  test('search suggestions shows iteration fields title', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('ite')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Iteration'))
    await page.keyboard.press('Enter')
    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('iteration:')
  })

  test('search suggestions only shows iterations values that are currently in use', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('ite')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Iteration'))
    await page.keyboard.press('Enter')

    // 3 custom values, 2 of the items are pregenerated i.e No and Exclude, and then the two actual iterations
    await memex.filter.expectSuggestionsResultCount(9)
    await memex.filter.expectToHaveSuggestions([
      '@current',
      '@next',
      '@previous',
      'Has iteration',
      'No iteration',
      'Exclude iteration',
      'Iteration 0',
      'Iteration 4',
      'Iteration 5',
    ])
  })
})
