import {expect, type Locator, type Page} from '@playwright/test'

import {_} from '../helpers/dom/selectors'
import {testPlatformMeta} from '../helpers/utils'
import {BasePageViewWithMemexApp} from './base-page-view'
import type {MemexApp} from './memex-app'

const OPEN_FILTER_BAR_KEYS = `${testPlatformMeta}+/`

/**
 * Fixture for the filter (or "search") feature that controls
 * querying of items within the project.
 */
export class Filter extends BasePageViewWithMemexApp {
  /**
   * The input field for the filter query.
   */
  INPUT: Locator
  /**
   * Targets an element within the search control, that is not specifically the input
   */
  SEARCH_INPUT_ROW: Locator
  /**
   * The button within the filter input for clearing the current query
   */
  CLEAR_FILTER_BUTTON: Locator

  constructor(page: Page, memex: MemexApp, root?: Locator) {
    super(page, memex)

    const baseFilterInput = root || page.getByTestId('base-filter-input')
    this.SEARCH_INPUT_ROW = baseFilterInput
    this.INPUT = baseFilterInput.locator('input[placeholder="Filter by keyword or by field"]')
    this.CLEAR_FILTER_BUTTON = baseFilterInput.getByTestId('clear-filter-query')
  }

  /**
   * The list for search suggestions.
   */
  SUGGESTIONS = this.page.getByTestId('search-suggestions-box')

  /**
   * Items suggested by the filter. This locator matches any item with a test
   * id that starts with this string, so we can't use `getByTestId` here.
   *
   * NOTE: There will most likely be multiple elements for this locator
   */
  SUGGESTIONS_ITEMS = this.page.locator('[data-testid^="search-suggestions-item"]')

  /**
   * The number of suggestions displayed in the menu, presented to screen readers only
   */

  SUGGESTIONS_RESULT_COUNT = this.page.getByTestId('search-suggestions-box-feedback')

  SAVE_CHANGES = this.page.getByTestId('filter-actions-save-changes-button')

  RESET_CHANGES = this.page.getByTestId('filter-actions-reset-changes-button')

  public async toggleFilter() {
    await this.page.keyboard.press(OPEN_FILTER_BAR_KEYS)
    // Ideally we wouldn't have to do this, but without it, some downstream
    // test interactions become flaky.
    // Once omnibar helpers have been converted to use locator-based APIs,
    // we should look at removing this additional waitFor
    const elementHandle = await this.INPUT.elementHandle()
    await elementHandle.waitForElementState('stable')
  }

  public async filterBy(filter: string) {
    await this.toggleFilter()
    await this.INPUT.fill(filter)
    await this.page.waitForSelector(_('filter-results-count'))
  }

  public async expectToHaveSuggestions(suggestions: Array<string>) {
    return expect(this.SUGGESTIONS_ITEMS).toHaveText(suggestions)
  }

  public async expectToHaveSuggestionsForQuery(filterQuery: string, suggestions: Array<string>) {
    await this.INPUT.fill(filterQuery)
    await this.expectToHaveSuggestions(suggestions)
  }

  public async expectSuggestionsNotToBeVisible() {
    return expect(this.SUGGESTIONS).toBeHidden()
  }

  public async expectSuggestionsResultCount(num: number) {
    const count = await this.SUGGESTIONS_RESULT_COUNT.innerText()
    return expect(count).toEqual(`${num} result${num === 1 ? '' : 's'}.`)
  }

  public async expectNotToBeFocused() {
    return expect(this.INPUT).not.toBeFocused()
  }

  public async expectToBeFocused() {
    return expect(this.INPUT).toBeFocused()
  }

  public async expectToHaveValue(value: string) {
    return expect(this.INPUT).toHaveValue(value)
  }

  public getLocatorForSuggestedItem(itemName: string) {
    return this.SUGGESTIONS_ITEMS.getByText(itemName)
  }

  public async expectTextForSelectedSuggestedItem(expectedText: string) {
    const suggestedItems = await this.SUGGESTIONS_ITEMS.all()
    for (const item of suggestedItems) {
      if ((await item.getAttribute('aria-selected')) === 'true') {
        await expect(item).toHaveText(expectedText)
        return
      }
    }

    throw new Error('No selected item found')
  }
}
