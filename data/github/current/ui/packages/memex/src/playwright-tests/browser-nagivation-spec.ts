import {test} from './fixtures/test-extended'
import {isNotSortedBy, isSortedBy} from './helpers/table/assertions'
import {sortByColumnName} from './helpers/table/interactions'

const SORTED_BY_COLUMN_ID_KEY = 'sortedBy[columnId]'

test.describe('Browser Navigation', () => {
  test('it should allow a user to to make changes to state, then go back/forward to apply/reapply those changes', async ({
    memex,
    page,
  }) => {
    test.fixme()

    await memex.navigateToStory('integrationTestsWithItems')

    await isNotSortedBy(page, 'Title')
    await sortByColumnName(page, 'Title')
    await isSortedBy(page, 'Title')

    await page.waitForFunction(p => {
      const url = new URL(p.url())
      return url.searchParams.get(SORTED_BY_COLUMN_ID_KEY) === 'Title'
    }, page)

    await isNotSortedBy(page, 'Status')
    await sortByColumnName(page, 'Status')
    await isSortedBy(page, 'Status')

    await page.waitForFunction(p => {
      const url = new URL(p.url())
      return url.searchParams.get(SORTED_BY_COLUMN_ID_KEY) === 'Status'
    }, page)
  })
})

test.describe('Browser Navigation [Saved views]', () => {
  test('it should allow a user to to make changes to state, then go back/forward to apply/reapply those changes', async ({
    memex,
    page,
  }) => {
    test.fixme()

    await memex.navigateToStory('integrationTestsWithItems')

    await isNotSortedBy(page, 'Title')
    await sortByColumnName(page, 'Title')
    await isSortedBy(page, 'Title')

    await page.waitForFunction(p => {
      const url = new URL(p.url())
      return url.searchParams.get(SORTED_BY_COLUMN_ID_KEY) === 'Title'
    }, page)

    await isNotSortedBy(page, 'Status')
    await sortByColumnName(page, 'Status')
    await isSortedBy(page, 'Status')

    await page.waitForFunction(p => {
      const url = new URL(p.url())
      return url.searchParams.get(SORTED_BY_COLUMN_ID_KEY) === 'Status'
    }, page)
  })
})
