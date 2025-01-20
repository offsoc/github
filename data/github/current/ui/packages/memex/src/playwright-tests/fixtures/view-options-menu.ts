import {expect} from '@playwright/test'

import {testPlatformMeta} from '../helpers/utils'
import {BasePageViewWithMemexApp} from './base-page-view'

export class ViewOptionsMenu extends BasePageViewWithMemexApp {
  VIEW_OPTIONS_MENU = this.page.getByTestId('view-options-menu-modal').getByRole('menu')
  VIEW_OPTIONS_MENU_TOGGLE = this.page.getByTestId('view-options-menu-toggle')
  VIEW_TYPE_BOARD = this.page.getByTestId('view-type-board')
  VIEW_TYPE_TABLE = this.page.getByTestId('view-type-table')
  VIEW_TYPE_ROADMAP = this.page.getByTestId('view-type-roadmap')
  VIEW_DIRTY_INDICATOR = this.page.getByTestId('view-options-dirty')
  SAVE_CHANGES = this.page.getByTestId('view-options-menu-save-changes-button')
  RESET_CHANGES = this.page.getByTestId('view-options-menu-reset-changes-button')
  VIEW_OPTIONS_MENU_VISIBLE_COLUMNS = this.page.getByTestId('view-options-menu-item-add-field-menu')
  VIEW_OPTIONS_MENU_MARKER_COLUMNS = this.page.getByTestId('view-options-menu-item-markers-menu')
  VISIBLE_COLUMNS_MENU = this.page.getByTestId('visible-columns-menu')
  VIEW_OPTIONS_MENU_GROUP_BY = this.page.getByTestId('view-options-menu-item-group-by-menu')
  VIEW_OPTIONS_MENU_COLUMN_BY = this.page.getByTestId('view-options-menu-item-column-by-menu')
  VIEW_OPTIONS_MENU_SORTED_BY = this.page.getByTestId('view-options-menu-item-sort-by-menu')
  VIEW_OPTIONS_MENU_SLICE_BY = this.page.getByTestId('view-options-menu-item-slice-by-menu')
  EXPORT_VIEW_DATA = this.page.getByRole('menuitem', {name: 'Export view data'})
  SORT_BY_MENU = this.page.getByTestId('sort-by-menu')
  GROUP_BY_MENU = this.page.getByTestId('group-by-menu')
  SLICE_BY_MENU = this.page.getByTestId('slice-by-menu')
  NEW_FIELD_BUTTON = this.page.getByTestId('new-field-button')
  ADD_COLUMN_MENU = this.page.getByTestId('add-column-menu')

  ROADMAP_SHOW_DATE_FIELDS = this.VIEW_OPTIONS_MENU.getByRole('menuitemcheckbox', {name: /^Show date fields/})
  ROADMAP_DATE_FIELDS = this.VIEW_OPTIONS_MENU.getByRole('menuitem', {name: /^Date fields:/})
  ROADMAP_DATE_FIELDS_MENU = this.page.getByRole('dialog', {name: 'Select date fields'})
  ROADMAP_DATE_FIELDS_START_GROUP = this.page.getByRole('group', {name: 'Start date'})
  ROADMAP_DATE_FIELDS_TARGET_GROUP = this.page.getByRole('group', {name: 'Target date'})

  ROADMAP_ZOOM_LEVEL = this.VIEW_OPTIONS_MENU.getByRole('menuitem', {name: /^Zoom level:/})
  ROADMAP_ZOOM_LEVEL_MENU = this.page.getByRole('dialog', {name: /Select zoom level/})

  async saveChanges() {
    await this.page.keyboard.press(`${testPlatformMeta}+s`)
  }

  async discardChanges() {
    await this.open()
    await this.RESET_CHANGES.click()
    await this.close()
  }

  async open() {
    await this.VIEW_OPTIONS_MENU_TOGGLE.click()
  }

  async close() {
    await this.page.keyboard.press('Escape')
  }

  async switchToBoardView() {
    await this.open()
    await this.VIEW_TYPE_BOARD.click()
    await this.close()
  }

  async switchToTableView() {
    await this.open()
    await this.VIEW_TYPE_TABLE.click()
    await this.close()
  }

  async switchToRoadmapView() {
    await this.open()
    await this.VIEW_TYPE_ROADMAP.click()
    await this.close()
  }

  async setGroupByColumn(columnName: string) {
    await this.VIEW_OPTIONS_MENU_GROUP_BY.click()
    await this.GROUP_BY_MENU.getByTestId(`group-by-${columnName}`).click()
  }

  async setSortByColumn(columnName: string) {
    await this.VIEW_OPTIONS_MENU_SORTED_BY.click()
    await this.SORT_BY_MENU.getByTestId(`sort-by-${columnName}`).click()
  }

  async expectViewStateIsDirty() {
    /**using nth since we currently have 2 indicators (tab and view options menu) */
    return expect(this.VIEW_DIRTY_INDICATOR.nth(0)).toBeVisible()
  }
  async expectViewStateNotDirty() {
    /**using nth since we currently have 2 indicators (tab and view options menu) */
    return expect(this.VIEW_DIRTY_INDICATOR.nth(0)).toBeHidden()
  }

  visibleColumnItem(columnName: string) {
    return this.page.getByTestId(`visible-column-item-${columnName}`)
  }

  hiddenColumnItem(columnName: string) {
    return this.page.getByTestId(`hidden-column-item-${columnName}`)
  }

  deleteViewItem() {
    return this.page.getByTestId('view-options-menu-item-delete-view')
  }

  duplicateViewItem() {
    return this.page.getByTestId('view-options-menu-item-duplicate-view')
  }

  renameViewItem() {
    return this.page.getByTestId('view-options-menu-item-rename-view')
  }

  fieldSumItem() {
    return this.page.getByTestId('view-options-menu-item-field-sum-menu')
  }

  showInsightsItem() {
    return this.page.getByTestId('view-options-menu-item-show-insights')
  }
}
