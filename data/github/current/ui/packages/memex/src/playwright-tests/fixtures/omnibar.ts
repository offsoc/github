import {expect, type Locator, type Page} from '@playwright/test'

import {Resources} from '../../client/strings'
import {BasePageViewWithMemexApp} from './base-page-view'
import type {MemexApp} from './memex-app'
import {OmnibarDiscoverySuggestions} from './omnibar-discovery-suggestions'

/**
 * Fixture for the omnibar that controls adding issues to the project.
 */
export class Omnibar extends BasePageViewWithMemexApp {
  discoverySuggestions: OmnibarDiscoverySuggestions
  repositoryList: OmnibarRepositoryList
  issuePicker: OmnibarIssuePicker

  /**
   * The input for the omnibar that allows searching for existing issues,
   * and also adding new issues.
   */
  INPUT: Locator

  /**
   * Locator for the button to add a new item to the project.
   */
  NEW_ITEM: Locator

  /**
   * Locator for a pill in the omnibar after the repo has been selected
   */
  SELECTED_REPOSITORY: Locator

  constructor(page: Page, memex: MemexApp, root?: Locator) {
    super(page, memex)
    const omnibarRoot = root || page
    this.discoverySuggestions = new OmnibarDiscoverySuggestions(page, memex)
    this.repositoryList = new OmnibarRepositoryList(page, memex)
    this.issuePicker = new OmnibarIssuePicker(page, memex)

    this.INPUT = omnibarRoot.getByTestId('repo-searcher-input')
    this.NEW_ITEM = omnibarRoot.getByRole('button', {name: Resources.createNewItemOrAddExistingIssueAriaLabel})
    this.SELECTED_REPOSITORY = omnibarRoot.getByTestId('repo-searcher-selected-repo')
  }

  /**
   * If the input isn't focused when input is entered, it may not be in the
   * viewport resulting in the newly added item not being visible and
   * virtualized out of view.
   *
   * @param text The text to enter into the omnibar input.
   */
  async focusAndEnterText(text: string) {
    await this.INPUT.focus()
    await this.INPUT.fill(text)
  }

  async expectInputToBeFocused() {
    return expect(this.INPUT).toBeFocused()
  }

  getInputForGroupLocator(groupName: string) {
    return this.page.getByTestId(`table-group-footer-${groupName}`).getByTestId('repo-searcher-input')
  }
}

export class OmnibarRepositoryList extends BasePageViewWithMemexApp {
  REPOSITORY_LIST = this.page.getByTestId('repo-searcher-list')
  REPOSITORY_LIST_ITEM = this.REPOSITORY_LIST.getByTestId('repo-searcher-item')

  getRepositoryListItemLocator(index: number) {
    return this.REPOSITORY_LIST_ITEM.nth(index)
  }
}

export class OmnibarIssuePicker extends BasePageViewWithMemexApp {
  ISSUE_PICKER_LIST = this.page.getByTestId('issue-picker-list')
  ISSUE_PICKER_ITEM = this.ISSUE_PICKER_LIST.getByTestId('issue-picker-item')
  BULK_ADD_ITEM = this.ISSUE_PICKER_LIST.getByTestId('add-multiple-items')

  getIssuePickerItemLocator(index: number) {
    return this.ISSUE_PICKER_ITEM.nth(index)
  }

  getIssuePickerItemTitle(index: number) {
    return this.getIssuePickerItemLocator(index).locator('span').nth(0).textContent()
  }
}
