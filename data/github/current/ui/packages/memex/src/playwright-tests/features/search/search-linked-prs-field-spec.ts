import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by linked pull request field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
  })

  test('shows correct number of items when filtering is done based on pull request numbers', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('linked-pull-requests:123', rowSelector, 1)
    await memex.sharedInteractions.filterToExpectedCount('linked-pull-requests:1234', rowSelector, 1)
    await memex.sharedInteractions.filterToExpectedCount('linked-pull-requests:111111', rowSelector, 0)
  })

  test('search suggestions shows linked pull request field', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('linked')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Linked pull requests'))
    await page.keyboard.press('Enter')
    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('linked-pull-requests:')
  })
})
