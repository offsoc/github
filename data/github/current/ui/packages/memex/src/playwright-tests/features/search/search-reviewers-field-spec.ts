import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('Filtering by reviewers field values', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
  })

  //github.com/github/memex/issues/9302
  test.fixme('shows correct number of items when filtering is done based on reviewer login', async ({memex}) => {
    await memex.sharedInteractions.filterToExpectedCount('reviewers:dmarcey', rowSelector, 1)
    await memex.sharedInteractions.filterToExpectedCount('reviewers:maxbeizer', rowSelector, 1)
    await memex.sharedInteractions.filterToExpectedCount('reviewers:not_a_user', rowSelector, 0)
    await memex.sharedInteractions.filterToExpectedCount('no:reviewers', rowSelector, 6)
  })

  test('search suggestions shows reviewers field', async ({page, memex}) => {
    await memex.filter.toggleFilter()
    await page.keyboard.insertText('reviewe')
    await page.waitForSelector(_('search-suggestions-box'))
    await page.waitForSelector(_('search-suggestions-item-Reviewers'))
    await page.keyboard.press('Enter')
    await memex.filter.expectToBeFocused()
    await memex.filter.expectToHaveValue('reviewers:')
  })
})
