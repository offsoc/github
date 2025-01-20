import {waitForSelectorCount} from '../helpers/dom/assertions'
import {BasePageViewWithMemexApp} from './base-page-view'

export class SharedInteractions extends BasePageViewWithMemexApp {
  public async focusOmnibarInEmptyProjectOnPageLoad() {
    // Close the templates dialog
    await this.memex.templateDialog.close()

    // Clicking the + New Item Button should close this menu and focus the omnibar
    await this.memex.omnibar.NEW_ITEM.click()
    await this.memex.omnibar.expectInputToBeFocused()
  }

  public async filterToExpectedCount(filter: string, itemSelector: string, expectedCount: number) {
    await this.memex.filter.filterBy(filter)
    await waitForSelectorCount(this.page, itemSelector, expectedCount)
  }
}
