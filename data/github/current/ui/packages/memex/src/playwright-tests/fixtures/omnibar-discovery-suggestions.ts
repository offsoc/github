import {BasePageViewWithMemexApp} from './base-page-view'

/**
 * Fixture for the discovery suggestions that display around the omnibar
 * to suggest things to add to the project.
 */
export class OmnibarDiscoverySuggestions extends BasePageViewWithMemexApp {
  /**
   * Locator for the discovery suggestions list element / container.
   */
  LIST = this.page.getByTestId('discovery-suggestions')
  /**
   * Locator for all of the suggestions within the discovery suggestions list.
   */
  LIST_ITEMS = this.LIST.getByRole('option')
  /**
   * Locator for the suggestion to an add an issue from a repository.
   */
  ADD_ISSUE = this.LIST.locator('text="Add an issue from a repository"')
  /**
   * Locator for the suggestion to open the command palette.
   */
  COMMAND_PALETTE = this.LIST.locator('text="Command palette"')
  /**
   * Locator for the suggestion to visit the help and documentation page.
   */
  HELP = this.LIST.locator('text="Help and documentation"')
  /**
   * Locator for the suggestion to create a draft issue.
   */
  CREATE_ISSUE = this.LIST.locator('text="Create new issue"')
  /**
   * Locator for the suggestion to create a draft issue.
   */
  ADD_ITEM_SIDEPANEL = this.LIST.locator('text="Add item from repository"')
}
