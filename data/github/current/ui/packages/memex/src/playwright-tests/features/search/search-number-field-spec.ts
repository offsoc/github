import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by number field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
  })

  test('search suggestions shows number field title', async ({page, memex}) => {
    await memex.filter.toggleFilter()

    await page.keyboard.insertText('Est')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Estimate'))
    await page.keyboard.press('Enter')

    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('estimate:')
  })

  test('search suggestions shows number field values', async ({page, memex}) => {
    await memex.filter.toggleFilter()

    await page.keyboard.insertText('Estimate:')
    await page.waitForSelector(_('search-suggestions-box'))

    await memex.filter.expectSuggestionsResultCount(6)
    await memex.filter.expectToHaveSuggestions(['Has estimate', 'No estimate', 'Exclude estimate', '1', '3', '10'])
  })

  test('shows correct number of items when filtering is done based on number values', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('Estimate:10', rowSelector, 2)
    await memex.sharedInteractions.filterToExpectedCount('Estimate:3', rowSelector, 1)
  })
})
