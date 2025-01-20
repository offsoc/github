import {expect, type Locator, type Page} from '@playwright/test'

import {_} from '../helpers/dom/selectors'
import {BasePageViewWithMemexApp} from './base-page-view'
import {test} from './test-extended'

export class InsightsPage extends BasePageViewWithMemexApp {
  HEADING = this.page.getByTestId('insights-header')
  DESCRIPTION = this.page.getByTestId('insights-description')
  ADD_CHART_BUTTON = this.page.getByTestId('add-chart-button')
  MY_CHART_NAVIGATION_ITEM = this.page.getByTestId('my-chart-navigation-item')
  DEFAULT_CHART_NAVIGATION_ITEM = this.page.getByTestId('default-chart-navigation-item')
  CHART_NAME_INPUT = this.page.getByTestId('insights-chart-name')
  CHART_NAME_EDITOR_BUTTON = this.page.getByTestId('chart-name-edit-button')
  CHART_NAME_EDITOR_INPUT = this.page.getByTestId('chart-name-editor-input')
  FILTER_RESULTS_COUNT = this.page.getByTestId('filter-results-count')
  FILTER_BAR_INPUT = this.page.getByTestId('insights-page').getByTestId('filter-bar-input')
  FILTER_BAR_SAVE_BUTTON = this.page.getByTestId('filter-actions-save-changes-button')
  CLEAR_FILTER_QUERY = this.page.getByTestId('insights-page').getByTestId('clear-filter-query')
  CHART_NAVIGATION_ITEM_OPTIONS_BUTTON = this.page.getByTestId('chart-options-button')
  CHART_NAVIGATION_ITEM_RENAME_INPUT = this.page.getByRole('textbox', {name: 'Chart name'})

  // Configuration pane locators
  CONFIGURE_BUTTON = this.page.locator('button:has-text("Configure")')
  CONFIGURATION_PANE = this.page.getByTestId('insights-configuration-pane')
  CONFIGURATION_PANE_CLOSE_BUTTON = this.CONFIGURATION_PANE.getByTestId('side-panel-button-close')
  CONFIGURATION_SAVE_CHANGES_BUTTON = this.page.getByTestId('insights-save-changes')
  DROPDOWN_LIST = this.page.getByRole('menu')
  DROPDOWN_LIST_ITEM = this.DROPDOWN_LIST.locator('li')
  LAYOUT_DROPDOWN_BUTTON = this.CONFIGURATION_PANE.getByRole('button', {name: /Layout/})
  X_AXIS_DROPDOWN_BUTTON = this.CONFIGURATION_PANE.getByRole('button', {name: /X-axis/})
  X_AXIS_GROUP_BY_DROPDOWN_BUTTON = this.CONFIGURATION_PANE.getByRole('button', {name: /Group by/})
  // The name selector for this button excludes the "Y-axis field" button. We can't do an exact match for Y-axis,
  // because the label also includes the current value, which could be nearly anything.
  Y_AXIS_DROPDOWN_BUTTON = this.CONFIGURATION_PANE.getByRole('button', {name: /^Y-axis(?! field)/})
  Y_AXIS_FIELD_DROPDOWN_BUTTON = this.CONFIGURATION_PANE.getByRole('button', {name: /Y-axis field/})
  INSIGHTS_CHANGE_BANNER = this.page.getByTestId('insights-changes-banner')

  getDefaultChartNavigationItemForIndex(index: number) {
    return new InsightsNavLinkItem(this.page, this.DEFAULT_CHART_NAVIGATION_ITEM.nth(index))
  }
  getMyChartNavigationItemForIndex(index: number) {
    return new InsightsNavLinkItem(this.page, this.MY_CHART_NAVIGATION_ITEM.nth(index))
  }
}

class InsightsNavLinkItem {
  page: Page
  item: Locator
  CHART_OPTIONS_BUTTON: Locator
  OPEN_CONFIGURE_BUTTON: Locator

  constructor(page: Page, item: Locator) {
    this.item = item
    this.page = page
    this.CHART_OPTIONS_BUTTON = this.item.getByTestId('chart-options-button')
    this.OPEN_CONFIGURE_BUTTON = this.page.getByTestId('chart-options-open-configure')
  }

  async openChartOptions() {
    return this.CHART_OPTIONS_BUTTON.click()
  }

  async openConfigPane() {
    return this.OPEN_CONFIGURE_BUTTON.click()
  }

  async expectConfigButtonNotToBeVisible() {
    return expect(this.OPEN_CONFIGURE_BUTTON).toBeHidden()
  }

  async expectToShowDirtyIndicator() {
    // Expects either the chart options menu dirty indicator, or the dirty indicator on the nav item
    return expect(
      this.item.locator(`${_('chart-options-dirty')}, ${_('my-chart-navigation-item-dirty')}`),
    ).toBeVisible()
  }

  async expectToShowViewOptions() {
    return test.expect(this.item.getByTestId('chart-options-button')).toBeVisible()
  }

  async expectToBeActive() {
    return test.expect(this.item).toHaveAttribute('aria-current', 'page')
  }
  async expectNotToBeActive() {
    return test.expect(this.item).not.toHaveAttribute('aria-current', 'page')
  }

  async click(...args: Parameters<Locator['click']>) {
    return this.item.click(...args)
  }
}
