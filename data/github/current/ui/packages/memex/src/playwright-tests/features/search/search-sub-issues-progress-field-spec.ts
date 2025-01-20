import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by sub-issues progress field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {viewType: 'table'})
  })

  test('shows correct number of items when filtering on sub-issues progress', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('no:sub-issues-progress', rowSelector, 28)
    await memex.sharedInteractions.filterToExpectedCount('-no:sub-issues-progress', rowSelector, 2)
    await memex.sharedInteractions.filterToExpectedCount('has:sub-issues-progress', rowSelector, 2)
    await memex.sharedInteractions.filterToExpectedCount('-has:sub-issues-progress', rowSelector, 28)
  })

  test('search suggestions show sub-issues progress field', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('su')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Sub-issues progress'))
    await page.keyboard.press('Enter')
    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('sub-issues-progress:')
  })
})
