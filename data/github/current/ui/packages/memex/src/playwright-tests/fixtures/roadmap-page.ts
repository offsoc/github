import type {Locator, Page} from '@playwright/test'

import {containsDOMFocus, dragTo, mustGetCenter} from '../helpers/dom/interactions'
import {getCellModeFromLocator, getOmnibarHasFocus} from '../helpers/table/selectors'
import {BasePageViewWithMemexApp} from './base-page-view'
import type {MemexApp} from './memex-app'
import {test} from './test-extended'

const PILL_LINK_SELECTOR = 'roadmap-view-item-pill'

export class RoadmapPage extends BasePageViewWithMemexApp {
  constructor(page: Page, memex: MemexApp) {
    super(page, memex)
  }

  ROADMAP_VIEW = this.page.getByTestId('roadmap-view')
  ROADMAP_HEADER = this.page.getByTestId('roadmap-header')
  ROADMAP_HEADER_DATES = this.ROADMAP_HEADER.locator('time')

  ROADMAP_CONTROL_ZOOM = this.page.getByTestId('quick-action-toolbar-zoom-level')
  ROADMAP_CONTROLS_DATE_FIELDS_DIRTY = this.page.getByTestId('roadmap-date-fields-dirty')
  ROADMAP_CONTROL_ZOOM_DIRTY = this.ROADMAP_CONTROL_ZOOM.getByTestId('roadmap-zoom-level-dirty')
  ROADMAP_CONTROL_ZOOM_MENU = this.page.getByTestId('roadmap-zoom-list')
  ROADMAP_CONTROLS_DATE_FIELDS = this.page.getByTestId('quick-action-toolbar-date-fields-menu')
  ROADMAP_CONTROLS_MARKERS = this.page.getByTestId('quick-action-toolbar-markers-menu')

  ROADMAP_DATE_FIELDS_MENU = this.page.getByTestId('roadmap-date-fields-menu')
  ROADMAP_DATE_FIELDS_MENU_NO_START = this.ROADMAP_DATE_FIELDS_MENU.getByTestId('date-field-no-start')
  ROADMAP_DATE_FIELDS_MENU_NO_END = this.ROADMAP_DATE_FIELDS_MENU.getByTestId('date-field-no-end')

  ROADMAP_MARKERS_MENU = this.page.getByTestId('roadmap-markers-menu')
  /**
   * getByLabel doesn't support aria-labels currently
   */
  ROADMAP_HEADER_TODAY = this.ROADMAP_HEADER.locator('[aria-current=date]')
  ROADMAP_ITEMS = this.page.getByTestId('roadmap-items')
  ROADMAP_ITEM_ROW_SELECTOR =
    '[role="row"]:not([data-testid="roadmap-omnibar-item"]):not([data-testid="roadmap-group-header-row"])'
  ROADMAP_ITEM_ROWS = this.ROADMAP_ITEMS.locator(this.ROADMAP_ITEM_ROW_SELECTOR)
  ROADMAP_OMNIBAR_ROW = this.ROADMAP_ITEMS.getByTestId('roadmap-omnibar-item')

  FILTER_BAR_INPUT = this.page.getByTestId('filter-bar-input')
  ROW_MENU_TRIGGER = this.page.getByTestId('row-menu-trigger')
  ROW_MENU_DELETE = this.page.getByTestId('row-menu-delete')
  ROW_MENU_ARCHIVE = this.page.getByTestId('row-menu-archive')
  ROW_MENU_DELETE_MULTIPLE = this.page.getByTestId('row-menu-delete-multiple')
  ROW_MENU_ARCHIVE_MULTIPLE = this.page.getByTestId('row-menu-archive-multiple')
  ROW_MENU_CONVERT_TO_ISSUE = this.page.getByTestId('row-menu-convert-to-issue')
  REPO_PICKER_REPO_LIST = this.page.getByTestId('repo-picker-repo-list')

  ROADMAP_TABLE_DRAG_SASH = this.ROADMAP_ITEMS.getByTestId('roadmap-table-drag-sash')
  ROADMAP_HEADER_DRAG_SASH = this.ROADMAP_HEADER.getByTestId('roadmap-table-drag-sash')

  MILESTONE_MARKER_HEADERS = this.page.getByTestId('roadmap-milestone-marker-header')
  MILESTONE_MARKER_SELECTOR = this.page.getByTestId('roadmap-milestone-marker-selector')

  ITERATION_MARKER_SELECTOR = this.page.getByTestId('roadmap-iteration-marker-selector')

  CUSTOM_DATE_MARK_LINE = this.page.getByTestId('custom-date-marker-line')

  PILL_SELECTOR = '[role=gridcell][data-testid=roadmap-pill]'

  /**
   * Returns the table width by adding the width of the first row's rank and title cells
   * @returns Promise<number> - the width of the first rank and title cells
   */
  async getTableWidth(): Promise<number> {
    const firstRankCellWidth = this.getRowDragHandle(0).evaluate(el => el.getClientRects()[0].width)
    const firstTitleCellWidth = this.getTitleCell(0).evaluate(el => el.getClientRects()[0].width)

    return Promise.all([firstRankCellWidth, firstTitleCellWidth]).then(([rankWidth, titleWidth]) => {
      return rankWidth + titleWidth
    })
  }

  getHeaderTodayIndex() {
    return this.ROADMAP_HEADER_TODAY.getAttribute('data-index')
  }

  getHeaderDateForIndex(index: number) {
    return this.ROADMAP_HEADER_DATES.nth(index)
  }

  getPill(opts: {name: string | RegExp}) {
    return new Pill(
      this.ROADMAP_ITEMS.locator(this.PILL_SELECTOR, {
        hasText: opts.name,
      }),
    )
  }

  getRowByTitle(title: string) {
    return this.ROADMAP_ITEMS.getByRole('row').filter({
      has: this.page.getByRole('gridcell', {name: new RegExp(title)}),
    })
  }

  dateFieldStart(columnName) {
    return this.ROADMAP_DATE_FIELDS_MENU.getByTestId(`date-field-start-${columnName}`)
  }

  dateFieldEnd(columnName) {
    return this.ROADMAP_DATE_FIELDS_MENU.getByTestId(`date-field-end-${columnName}`)
  }

  getGroup(groupName: string) {
    return this.ROADMAP_ITEMS.getByTestId(`roadmap-group-${groupName}`)
  }

  getGroupOmnibar(groupName: string) {
    return this.getGroup(groupName).getByTestId('omnibar')
  }

  getGroupOmnibarHasFocus(groupName: string) {
    const omnibar = this.getGroup(groupName).getByTestId('omnibar')
    return getOmnibarHasFocus(this.page, omnibar)
  }

  getOmnibarHasFocus() {
    const omnibar = this.page.getByTestId('omnibar')
    return getOmnibarHasFocus(this.page, omnibar)
  }

  getRowByIndex(index: number, group?: string) {
    const rows = group ? this.getGroup(group).locator(this.ROADMAP_ITEM_ROW_SELECTOR) : this.ROADMAP_ITEM_ROWS
    return rows.nth(index)
  }

  getRowCount(group?: string) {
    return group ? this.getGroup(group).locator(this.ROADMAP_ITEM_ROW_SELECTOR).count() : this.ROADMAP_ITEM_ROWS.count()
  }

  async getLastRowIndex(group?: string) {
    const count = await this.getRowCount(group)
    return count - 1
  }

  getCell(rowIndex: number, columnName: string, group?: string) {
    const row = this.getRowByIndex(rowIndex, group)
    return row.getByTestId(RegExp(`column: ${columnName}`))
  }

  getRowDragHandle(rowIndex: number, group?: string) {
    return this.getCell(rowIndex, 'row-drag-handle', group)
  }

  getTitleCell(rowIndex: number, group?: string) {
    return this.getCell(rowIndex, 'Title', group)
  }

  async getCellMode(rowIndex: number, columnName: string, group?: string) {
    const cell = this.getCell(rowIndex, columnName, group)
    const selector = await cell.getAttribute('date-testid')
    return getCellModeFromLocator(this.page, cell, selector)
  }

  getNavigationButtonForRow(rowIndex: number, group?: string) {
    return this.getRowByIndex(rowIndex, group).getByTestId('roadmap-navigation-button')
  }

  getAddDateButtonForRow(rowIndex: number, group?: string) {
    return this.getRowByIndex(rowIndex, group).getByTestId('roadmap-add-date-button')
  }

  getItemLinkForRow(rowIndex: number, group?: string) {
    return this.getRowByIndex(rowIndex, group).getByTestId(PILL_LINK_SELECTOR)
  }

  async pillAreaElementInRowHasFocus(rowIndex: number, group?: string) {
    const locator = this.getRowByIndex(rowIndex, group).locator(this.PILL_SELECTOR)
    const handle = await locator.elementHandle()
    return containsDOMFocus(this.page, handle)
  }

  iterationMarkerNub(iterationId) {
    return this.ROADMAP_HEADER.getByTestId(`iteration-marker-nub-${iterationId}`)
  }

  iterationBreakMarkerNub(iterationId) {
    return this.ROADMAP_HEADER.getByTestId(`iteration-break-marker-nub-${iterationId}`)
  }

  iterationMarkerHeader(iterationId) {
    return this.ROADMAP_HEADER.getByTestId(`roadmap-iteration-marker-header-${iterationId}`)
  }

  async expectRowToBeSelected(index: number, group?: string) {
    const row = this.getRowByIndex(index, group)
    await test.expect(row).toHaveAttribute('data-test-row-is-selected', 'true')
  }

  async expectRowNotToBeSelected(index: number, group?: string) {
    const row = this.getRowByIndex(index, group)
    await test.expect(row).toHaveAttribute('data-test-row-is-selected', 'false')
  }

  async expectVisible() {
    await test.expect(this.ROADMAP_VIEW).toBeVisible()
  }
}

class Pill {
  locator: Locator
  LEADING_DRAG_HANDLE: PillDragHandle
  TRAILING_DRAG_HANDLE: PillDragHandle
  visiblePill: VisiblePill
  pillContent: PillContent
  pillForeground: PillLayer
  pillBackground: PillLayer
  pillDragTarget: PillLayer
  visibleLink: Locator

  constructor(locator: Locator) {
    this.locator = locator
    this.LEADING_DRAG_HANDLE = new PillDragHandle(this.locator.getByTestId('roadmap-view-item-expand-leading-handle'))
    this.TRAILING_DRAG_HANDLE = new PillDragHandle(this.locator.getByTestId('roadmap-view-item-expand-trailing-handle'))
    this.visiblePill = new VisiblePill(this.locator.getByTestId('roadmap-view-item-pill'))
    this.pillContent = new PillContent(this.locator.getByTestId('roadmap-view-item-pill-content'))
    this.pillForeground = new PillLayer(this.locator.getByTestId('roadmap-view-pill-foreground'))
    this.pillBackground = new PillLayer(this.locator.getByTestId('roadmap-view-pill-background'))
    this.pillDragTarget = new PillLayer(this.locator.getByTestId('roadmap-view-pill-drag-target'))
    this.visibleLink = this.locator.getByTestId(PILL_LINK_SELECTOR)
  }

  async getStartDate(): Promise<Date> {
    const date = await this.locator.getAttribute('data-date-start')
    test.expect(date).toMatch(/^(\d{4})-0?(\d+)-0?(\d+)/)

    return new Date(date)
  }

  async getEndDate(): Promise<Date> {
    const date = await this.locator.getAttribute('data-date-end')
    test.expect(date).toMatch(/^(\d{4})-0?(\d+)-0?(\d+)/)
    return new Date(date)
  }

  async boundingBox() {
    return this.locator.boundingBox()
  }

  async dragTo(cb: (x: number, y: number) => {x: number; y: number}, drop: boolean | undefined = true) {
    const pillLocator = this.visiblePill.locator
    const center = await mustGetCenter(pillLocator)
    return dragTo(pillLocator.page(), pillLocator, cb(center.x, center.y), undefined, drop)
  }

  async expectToHaveStartDate(dateString: string) {
    await test.expect(this.locator).toHaveAttribute('data-date-start', dateString)
  }

  async expectToHaveEndDate(dateString: string) {
    await test.expect(this.locator).toHaveAttribute('data-date-end', dateString)
  }

  async expectToBeVisible() {
    return test.expect(this.visiblePill.locator).toBeVisible()
  }

  async expectToBeHidden() {
    return test.expect(this.visiblePill.locator).toBeHidden()
  }

  async expectVisibleLinkFocused() {
    return test.expect(this.visibleLink).toBeFocused()
  }
}

class PillDragHandle {
  locator: Locator
  constructor(locator: Locator) {
    this.locator = locator
  }

  async dragTo(cb: (x: number, y: number) => {x: number; y: number}, opts?: Parameters<typeof dragTo>[3]) {
    const boundingBox = await this.locator.boundingBox()
    return dragTo(this.locator.page(), this.locator, cb(boundingBox.x, boundingBox.y), opts)
  }

  async expectToBeHidden() {
    return test.expect(this.locator).toBeHidden()
  }
}

class VisiblePill {
  locator: Locator
  constructor(locator: Locator) {
    this.locator = locator
  }

  async expectToHaveFocus() {
    return test.expect(this.locator).toBeFocused()
  }
}

class PillContent {
  locator: Locator
  constructor(locator: Locator) {
    this.locator = locator
  }
}

class PillLayer {
  locator: Locator
  constructor(locator: Locator) {
    this.locator = locator
  }

  getBoundingBox() {
    return this.locator.boundingBox()
  }
}
