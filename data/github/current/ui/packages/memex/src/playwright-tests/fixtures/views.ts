import {expect, type Locator} from '@playwright/test'

import {dragTo, mustGetCenter} from '../helpers/dom/interactions'
import {BasePageViewWithMemexApp} from './base-page-view'

export class Views extends BasePageViewWithMemexApp {
  VIEW_TAB_LIST = this.page.getByLabel('Select view').getByRole('tablist')
  VIEW_TABS = this.VIEW_TAB_LIST.getByTestId('view-navigation-view-tab-link')
  NEW_VIEW_BUTTON = this.VIEW_TAB_LIST.locator('text=New view')
  NEW_VIEW_BUTTON_OVERLAY = this.page.getByTestId('view-navigation-create-new-view-overlay')
  ACTIVE_TAB = this.VIEW_TAB_LIST.locator('[aria-selected="true"]')
  DIRTY_INDICATOR_SELECTOR = this.page.getByTestId('view-options-dirty')

  public getNames() {
    // Trim the tab names after getting them, because Safari preserves the newlines in the tab names like "\nTab 1\n"
    return this.VIEW_TABS.allInnerTexts().then(names => names.map(name => name.trim()))
  }

  public expectViewToHaveUnsavedChanges() {
    return expect(this.DIRTY_INDICATOR_SELECTOR).toBeVisible()
  }

  public async dragView(viewToDrag: Locator, position: 'before' | 'after', viewToDropNear: Locator) {
    const dragHandle = viewToDrag.locator('svg').nth(0)
    const offset = position === 'before' ? -15 : 15
    const dropX = (await mustGetCenter(viewToDropNear)).x + offset
    await dragTo(this.page, dragHandle, {x: dropX})
  }

  public async createNewView(viewType: 'Table' | 'Board' | 'Roadmap' = 'Table') {
    await this.NEW_VIEW_BUTTON.click()
    await this.NEW_VIEW_BUTTON_OVERLAY.getByText(viewType, {exact: false}).click()
  }

  public async expectViewIndexActive(index: number) {
    await expect(this.VIEW_TABS.nth(index)).toHaveAttribute('aria-selected', 'true')
  }

  public async showViewTabRenameInput(index: number) {
    await this.VIEW_TABS.nth(index).getByTestId('view-name-static').dblclick()
  }

  public getViewTabRenameInput(index: number) {
    return this.VIEW_TABS.nth(index).getByTestId('view-name-input')
  }

  public async expectViewTabToHaveOverflowHidden(index: number) {
    // The parent element of the input container is the one that we want to check the CSS for.
    const viewName = this.VIEW_TABS.nth(index).getByTestId('view-name-static')
    const parentDiv = viewName.locator('..')
    await expect(parentDiv).toHaveCSS('overflow', 'hidden')
  }
}
