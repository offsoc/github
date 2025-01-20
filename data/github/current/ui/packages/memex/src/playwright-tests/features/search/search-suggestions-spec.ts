import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustFind, mustNotFind} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {eventually} from '../../helpers/utils'
import type {ViewType} from '../../types/view-type'

const EXTENDED_TIMEOUT = 6000
test.describe('SearchSuggestions', () => {
  const testCases: Array<{view: ViewType; itemSelector: string}> = [
    {
      view: 'table',
      itemSelector: 'div[data-testid^=TableRow]',
    },
    {
      view: 'board',
      itemSelector: 'div[data-testid=board-view-column-card]',
    },
  ]

  for (const testCase of testCases) {
    test(`does not display suggestions upon load in ${testCase.view}`, async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        filterQuery: '-label:changelog',
      })

      await memex.filter.expectSuggestionsNotToBeVisible()
    })

    test.describe(`in ${testCase.view}`, () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('integrationTestsWithItems', {
          viewType: testCase.view,
        })

        // Show search input
        await memex.filter.toggleFilter()
      })

      test(`it shows the columns suggestion when clicking the input container`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        // suggestions are not shown on focus
        await mustNotFind(page, _('search-suggestions-box'))

        await page.keyboard.insertText('as')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Assignees'), {timeout: EXTENDED_TIMEOUT})
      })

      test(`it shows the column and keyword suggestions for negative search queries`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        // suggestions are not shown on focus
        await mustNotFind(page, _('search-suggestions-box'))

        await page.keyboard.insertText('-i')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Impact'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-is'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('Backspace')
        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Assignees'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.insertText('n')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-no'), {timeout: EXTENDED_TIMEOUT})
      })

      // https://github.com/github/memex/issues/9288
      test.fixme(`mixing negative queries with other queries updates search field correctly`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await memex.filter.expectToBeFocused()

        // suggestions are not shown on focus
        await mustNotFind(page, _('search-suggestions-box'))

        await page.keyboard.insertText('-as')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Assignees'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-assignee:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-no:assignee')

        await page.keyboard.insertText(' l')
        await page.waitForTimeout(500)

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-no:assignee label:')

        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')

        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-no:assignee label:"tech debt"')

        await page.keyboard.insertText(' -is')
        await page.waitForTimeout(500)
        await page.keyboard.press('Backspace')
        await page.keyboard.press('Backspace')
        await page.keyboard.press('Backspace')
        await page.keyboard.insertText('is')
        await page.waitForTimeout(500)

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-no:assignee label:"tech debt" is:')
      })

      test(`it does not show suggestions for unfilterable columns`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        // suggestions are not shown on focus
        await mustNotFind(page, _('search-suggestions-box'))

        await page.keyboard.insertText('titl')
        await page.waitForTimeout(500)

        // No suggestions as title column is not filterable
        await mustNotFind(page, _('search-suggestions-box'))

        await page.keyboard.insertText('e:')
        await page.waitForTimeout(500)

        // No suggestions even after typing `title:`
        await mustNotFind(page, _('search-suggestions-box'))
      })

      test(`supports keyboard navigation for selecting items`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('s')
        await page.waitForTimeout(500)

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Status'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('ArrowDown')
        await page.waitForTimeout(500)
        await memex.filter.expectTextForSelectedSuggestedItem('stage:')

        await page.keyboard.press('ArrowUp')
        await memex.filter.expectTextForSelectedSuggestedItem('status:')
      })

      test(`hides the suggestions with escape key`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('s')
        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('Escape')
        await mustNotFind(page, _('search-suggestions-box'))
      })

      test(`does not show any suggestions for text not matching existing filters`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await mustNotFind(page, _('search-suggestions-box'))

        await page.keyboard.insertText('fixes')
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('fixes')

        await page.waitForTimeout(500)
        await mustNotFind(page, _('search-suggestions-box'))
      })

      test(`shows present column values filter`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('labe')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Labels'), {timeout: EXTENDED_TIMEOUT})
        await memex.filter.expectTextForSelectedSuggestedItem('label:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('has:label')

        await page.waitForTimeout(500)

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('3')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(3)
      })

      test(`shows suggestions for has filter`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('has')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-has'), {timeout: EXTENDED_TIMEOUT})

        await memex.filter.expectTextForSelectedSuggestedItem('has:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('has:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('has:assignee')

        await page.waitForTimeout(500)

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('4')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(4)
      })

      test(`shows empty column values filter`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('labe')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Labels'), {timeout: EXTENDED_TIMEOUT})
        await memex.filter.expectTextForSelectedSuggestedItem('label:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:')

        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('no:label')
        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('4')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(4)
      })

      test(`shows suggestions for no filter`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('no')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-no'), {timeout: EXTENDED_TIMEOUT})

        await memex.filter.expectTextForSelectedSuggestedItem('no:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('no:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('no:assignee')
        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('3')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(3)
      })

      test(`shows negative filter option`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('stat')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Status'), {timeout: EXTENDED_TIMEOUT})

        await memex.filter.expectTextForSelectedSuggestedItem('status:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('status:')

        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-status:')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Has status'), {timeout: EXTENDED_TIMEOUT})
        await memex.filter.expectTextForSelectedSuggestedItem('Has status')

        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-status:Backlog')

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('5')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(5)
      })

      test(`shows suggestions for text matching existing filters`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('labe')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Labels'), {timeout: EXTENDED_TIMEOUT})

        await memex.filter.expectTextForSelectedSuggestedItem('label:')

        await page.keyboard.press('Enter')

        await page.waitForTimeout(500)
        await page.keyboard.insertText('"tech debt"')
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:"tech debt"')
        await page.waitForTimeout(500)
        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('1')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(1)
      })

      test(`shows suggestions for text matching existing filters with emojis`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('labe')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Labels'), {timeout: EXTENDED_TIMEOUT})

        await memex.filter.expectTextForSelectedSuggestedItem('label:')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await page.keyboard.insertText('"enhancement ✨"')
        await page.waitForTimeout(500)
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:"enhancement ✨"')

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('3')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(3)
      })

      test(`shows up the suggestion again after cleaning up the text`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('stat')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Status'), {timeout: EXTENDED_TIMEOUT})

        await memex.filter.expectTextForSelectedSuggestedItem('status:')

        await page.keyboard.press('Enter')

        await page.waitForTimeout(500)
        await page.keyboard.insertText('Done')
        await page.waitForSelector(_('search-suggestions-box'), {state: 'detached'})
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('status:Done')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        let resultsCountElement = await mustFind(page, _('filter-results-count'))
        expect(await resultsCountElement.textContent()).toEqual('3')
        let rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(3)

        for (let i = 0; i < 4; i++) {
          await page.keyboard.press('Backspace')
        }
        await page.waitForTimeout(500)

        await page.waitForTimeout(500)
        await page.keyboard.insertText('Backlog')
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('status:Backlog')
        await page.waitForSelector(_('search-suggestions-box'), {state: 'detached'})
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        resultsCountElement = await mustFind(page, _('filter-results-count'))
        expect(await resultsCountElement.textContent()).toEqual('2')
        rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(2)
      })

      test(`allows multiple filters`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('labe')
        await page.waitForTimeout(500)

        await mustFind(page, _('search-suggestions-box'))
        await mustFind(page, _('search-suggestions-item-Labels'))

        await memex.filter.expectTextForSelectedSuggestedItem('label:')

        await page.keyboard.press('Enter')

        await page.waitForTimeout(500)
        await page.keyboard.insertText('"tech debt"')
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:"tech debt"')
        await page.keyboard.press('Enter')

        await page.waitForTimeout(500)

        const resultsCountElement = await mustFind(page, _('filter-results-count'))
        expect(await resultsCountElement.textContent()).toEqual('1')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(1)

        // Extra whitespace char needed for this test to execute in Safari browser.
        // Otherwise Safari's smart substitution replaces `" ` with a `“`.
        await page.keyboard.insertText('  ')
        await page.waitForTimeout(500)

        await page.keyboard.insertText('stat')
        await page.waitForTimeout(500)

        await mustFind(page, _('search-suggestions-item-Status'))
        await page.keyboard.insertText('us')
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:"tech debt"  status')

        await page.waitForTimeout(500)
        await memex.filter.expectTextForSelectedSuggestedItem('status:')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await page.keyboard.insertText('Don')

        await page.waitForTimeout(500)
        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await mustFind(page, _('search-suggestions-item-Done'))
        await page.keyboard.press('Enter')

        await page.waitForTimeout(500)

        expect(await resultsCountElement.textContent()).toEqual('1')
        await expect(rowsOnPageAfterFilter).toHaveCount(1)
      })

      test(`allows filter with text column value that contains an emoji`, async ({page, memex}) => {
        await memex.filter.INPUT.click()

        await page.keyboard.insertText('custom')
        await expect(memex.filter.SUGGESTIONS).toBeVisible()

        await memex.filter.expectTextForSelectedSuggestedItem('custom text:')

        await page.keyboard.press('Enter') // select "custom text" from the dropdown

        // Wait for all options to show up
        await expect(
          memex.filter.getLocatorForSuggestedItem('🎉 https://github.com 🎉 https://microsoft.com'),
        ).toBeVisible()

        // Enter a search prefix prefix
        await page.keyboard.insertText('🎉')
        // Wait for filtering to happen
        await expect(memex.filter.SUGGESTIONS_ITEMS).toHaveCount(1)

        // Click the filtered value
        await page.keyboard.press('Enter')
        await memex.filter.expectToHaveValue('custom-text:"🎉 https://github.com 🎉 https://microsoft.com"')

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {
          timeout: EXTENDED_TIMEOUT,
        })
        await eventually(async () => {
          expect(await resultsCountElement.textContent()).toEqual('1')
        })
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(1)
      })

      test(`same filter can be applied multiple times`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)
        await page.keyboard.insertText('labe')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Labels'), {timeout: EXTENDED_TIMEOUT})

        await memex.filter.expectTextForSelectedSuggestedItem('label:')

        await page.keyboard.press('Enter')

        await page.waitForTimeout(500)
        await page.keyboard.insertText('blocker')
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:blocker')

        await page.keyboard.insertText(' ')
        await page.waitForTimeout(500)

        await page.keyboard.insertText('labe')

        await page.waitForSelector(_('search-suggestions-item-Labels'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.insertText('l')
        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:blocker label')

        await page.waitForTimeout(500)
        await memex.filter.expectTextForSelectedSuggestedItem('label:')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        await page.keyboard.insertText('enhanc')
        await page.waitForTimeout(500)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await memex.filter.expectToHaveValue('label:blocker label:"enhancement ✨"')
      })

      test(`shows suggestions for negative filters`, async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await page.waitForTimeout(500)

        await page.keyboard.insertText('-label:')
        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        const techDebtSuggestion = await page.waitForSelector(_('search-suggestions-item-tech debt'), {
          timeout: EXTENDED_TIMEOUT,
        })

        await techDebtSuggestion.click()
        await page.waitForTimeout(500)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-label:"tech debt"')

        await page.waitForTimeout(500)

        let resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('6')
        const rowsOnPageAfterFilter = page.locator(testCase.itemSelector)
        await expect(rowsOnPageAfterFilter).toHaveCount(6)

        await page.keyboard.insertText(' -no:')
        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-assignee'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-label:"tech debt" -no:assignee')

        resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('3')
        await expect(rowsOnPageAfterFilter).toHaveCount(3)

        await page.keyboard.insertText(' -is:')
        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-open'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('-label:"tech debt" -no:assignee -is:open')

        resultsCountElement = await page.waitForSelector(_('filter-results-count'), {timeout: EXTENDED_TIMEOUT})
        expect(await resultsCountElement.textContent()).toEqual('2')
        await expect(rowsOnPageAfterFilter).toHaveCount(2)
      })
    })
  }

  for (const testCase of testCases) {
    test.describe(`in ${testCase.view}`, () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('integrationTestsWithItems', {
          viewType: testCase.view,
          filterQuery: `label:"tech debt" assignee:lerebear`,
        })
      })

      test(`Search suggestions are parsed correctly from the URL search params`, async ({page, memex}) => {
        await memex.filter.INPUT.click({position: {x: 10, y: 10}})

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('label:"tech debt" assignee:lerebear')
        await page.keyboard.press('End')
        await page.keyboard.down('Meta')
        await page.keyboard.down('ArrowRight')
        await page.keyboard.up('Meta')
        await page.keyboard.type(' ')
        await page.waitForTimeout(500)
        await mustNotFind(page, _('search-suggestions-box'))

        await page.keyboard.type('stat')

        // status should be suggested as it is not in the search input
        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Status'), {timeout: EXTENDED_TIMEOUT})
      })
    })
  }

  for (const testCase of testCases) {
    test.describe(`in ${testCase.view}`, () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('integrationTestsWithItems', {
          viewType: testCase.view,
          filterQuery: 'status:',
        })
      })

      test('Search suggestions after a single quote', async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await memex.filter.expectToBeFocused()
        await page.keyboard.press('End')
        await page.keyboard.insertText("'")

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Backlog'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('status:Backlog')

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {
          timeout: EXTENDED_TIMEOUT,
        })
        expect(await resultsCountElement.textContent()).toEqual('2')
      })

      test('Search suggestions after a double quote', async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await memex.filter.expectToBeFocused()
        await page.keyboard.press('End')
        await page.keyboard.insertText('"')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Backlog'), {timeout: EXTENDED_TIMEOUT})

        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('status:Backlog')

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {
          timeout: EXTENDED_TIMEOUT,
        })
        expect(await resultsCountElement.textContent()).toEqual('2')
      })

      test('Search suggestions with colon', async ({page, memex}) => {
        await memex.filter.INPUT.click()
        await memex.filter.expectToBeFocused()
        await page.keyboard.press('End')
        await page.keyboard.insertText('"in:review",')

        await page.waitForSelector(_('search-suggestions-box'), {timeout: EXTENDED_TIMEOUT})
        await page.waitForSelector(_('search-suggestions-item-Backlog'), {timeout: EXTENDED_TIMEOUT})
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        await memex.filter.expectToBeFocused()
        await memex.filter.expectToHaveValue('status:"in:review",Backlog')

        const resultsCountElement = await page.waitForSelector(_('filter-results-count'), {
          timeout: EXTENDED_TIMEOUT,
        })
        expect(await resultsCountElement.textContent()).toEqual('2')
      })
    })
  }
})
