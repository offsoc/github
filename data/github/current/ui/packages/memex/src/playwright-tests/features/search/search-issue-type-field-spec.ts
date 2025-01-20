import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by issue type field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
  })

  test('shows correct number of items when filtering on issue type', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('type:Batch', rowSelector, 1)
    await memex.sharedInteractions.filterToExpectedCount('type:Bug', rowSelector, 1)
    await memex.sharedInteractions.filterToExpectedCount('no:type', rowSelector, 5)
    await memex.sharedInteractions.filterToExpectedCount('-no:type', rowSelector, 2)
  })

  test('search suggestions shows issue type field', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('ty')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Type'))
    await page.keyboard.press('Enter')
    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('type:')
  })
})
