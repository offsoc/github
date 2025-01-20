import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by iteration field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithReasonField', {viewType: 'table'})
  })

  test('shows correct number of items when filtering by reason as field or quantifier', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('reason:customer-request', rowSelector, 2)
    await memex.sharedInteractions.filterToExpectedCount('reason:completed', rowSelector, 2)
  })

  test('shows correct number of items when filtering by reason with different values', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('reason:customer-request,completed', rowSelector, 2)
    await memex.sharedInteractions.filterToExpectedCount('reason:"not planned","customer-request"', rowSelector, 3)
  })

  test('search suggestions shows reason field title once', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('rea')
    await page.waitForSelector(_('search-suggestions-box'))
    await waitForSelectorCount(page, _('search-suggestions-item-Reason'), 1)

    await page.keyboard.press('Enter')
    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('reason:')
  })
})
