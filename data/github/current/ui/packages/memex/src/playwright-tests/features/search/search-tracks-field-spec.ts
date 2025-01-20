import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by tracks field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
  })

  test('shows correct number of items when filtering on percentage', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('tracks:64%', rowSelector, 1)
    await memex.sharedInteractions.filterToExpectedCount('tracks:22%', rowSelector, 0)
    await memex.sharedInteractions.filterToExpectedCount('no:tracks', rowSelector, 6)
    await memex.sharedInteractions.filterToExpectedCount('-no:tracks', rowSelector, 1)
  })

  test('search suggestions shows reviewers field', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('tra')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Tracks'))
    await page.keyboard.press('Enter')
    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('tracks:')
  })
})
