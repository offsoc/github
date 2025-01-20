import {type ElementHandle, expect, type Locator, type Page} from '@playwright/test'

import {Resources} from '../../../client/strings'
import type {MemexApp} from '../../fixtures/memex-app'
import type {HTMLOrSVGElementHandle} from '../../types/dom'
import type {CustomColumnType} from '../../types/table'
import {mustFind, waitForSelectorCount} from '../dom/assertions'
import {dragTo} from '../dom/interactions'
import {_} from '../dom/selectors'
import {selectMenuOptionsAreLoaded} from './assertions'
import {getTableCell, getTableColumn} from './selectors'

// We have to carefully ensure we don't accidentally click the link for title
// cells, or the header resize handler.
const CELL_CLICK_POINT = {x: 10, y: 5}

/**
 * Set a particular cell to focused mode (i.e. by single click)
 *
 *
 * @param page Playwright page object
 * @param testId selector to locate on the page
 */
export async function setCellToFocusMode(page: Page, testId: string) {
  const targetCell = page.locator(testId)
  await targetCell.click({position: CELL_CLICK_POINT})
}

/**
 *  Set a particular cell to edit mode (i.e. by double click)
 *
 * @param page Playwright page object
 * @param testId selector to locate on the page
 */
export async function setCellToEditMode(page: Page, testId: string) {
  const targetCell = page.locator(testId)
  await targetCell.dblclick({position: CELL_CLICK_POINT})
}

/**
 * Utility method for locating a specific menu
 *
 * @param page Playwright page object
 * @param testEditorId selector to locate on the page
 */
export async function getSelectMenu(page: Page, testEditorId: string) {
  return mustFind(page, testEditorId)
}

/**
 * Check whether a given editor menu is open on the page
 *
 * @param page Playwright page object
 * @param testEditorId selector to locate on the page
 */
export async function isSelectMenuOpen(page: Page, testEditorId: string) {
  try {
    await getSelectMenu(page, testEditorId)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Select a given option in the open select menu.
 *
 * @param menu an element that should be active on the page
 * @param option the option text to find in the select menu
 */
export async function selectOption(menu: HTMLOrSVGElementHandle, option: string) {
  await selectMenuOptionsAreLoaded(menu)

  // eslint-disable-next-line no-restricted-syntax
  const listItem = await menu.$(`[role=option][aria-selected="false"] >> text=${option}`)

  if (!listItem) {
    throw new Error(`Could not find an unselected ${option} option in ${await menu.innerHTML()}`)
  }

  await listItem.click()
}

export async function getSelectMenuFilterInput(page: Page, testEditorId: string) {
  const menu = await getSelectMenu(page, testEditorId)

  // eslint-disable-next-line no-restricted-syntax
  const filterInput = await menu.$('input[type=text]')
  if (!filterInput) {
    throw new Error('Could not find filter input in menu')
  }

  return filterInput as ElementHandle<HTMLInputElement>
}

/**
 * Locate the menu trigger for a given table column.
 *
 * Will throw if the menu cannot be resolved.
 *
 * @param page Playwright page object
 * @param name column identifier
 */
export async function getColumnMenuTrigger(page: Page, name: string) {
  const column = await getTableColumn(page, name)
  const trigger = column.getByRole('button', {name: `${name} column options`})
  await expect(trigger).toBeVisible()
  return trigger
}

/**
 * Retrieve a specific menu option for a given menu
 *
 * @param page Playwright page object
 * @param columnName column to locate in the table header
 * @param buttonText expected text to find on menu option
 */
export function getColumnHeaderMenuOption(page: Page, columnName: string, buttonText: string) {
  return page.getByRole('menu', {name: `${columnName} column options`}).getByRole('menuitem', {name: buttonText})
}

/**
 * Sort the current table by a specific column type
 *
 * @param page Playwright page object
 * @param columnName column text used to identify column
 * @param optionName whether to sort by ascending or descending order
 */
export async function sortByColumnName(
  page: Page,
  columnName: string,
  optionName = Resources.tableHeaderContextMenu.sortAscending,
) {
  const menuTriggerTitle = await getColumnMenuTrigger(page, columnName)
  await menuTriggerTitle.click()

  // Find the menu item related to the sort option
  const sortColumnMenuOption = getColumnHeaderMenuOption(page, columnName, optionName)
  await sortColumnMenuOption.click()
}

export async function toggleGroupBy(page: Page, columnName: string) {
  const menuTrigger = await getColumnMenuTrigger(page, columnName)
  await menuTrigger.click()

  await page.click(_('group-by-trigger'))
}

export async function toggleGroupCollapsed(page: Page, groupName: string) {
  const toggle = await mustFind(page, _(`group-by-toggle-collapsed-${groupName}`))
  await toggle.click()
}

/**
 * Create a new column using the dialog within the app
 *
 * @param page Playwright page object
 * @param name column name
 * @param type (default: `text`) the type of column to create
 * @param save (default: `true`) whether to attempt to save the dialog (defaults to true)
 * @param wait (default: `true`) whether to wait for the new column to be visible as a table column header
 */
export async function createNewColumn(
  page: Page,
  name: string,
  type: CustomColumnType = 'text',
  save = true,
  wait = true,
) {
  const numInitialColumns = await page.getByRole('columnheader').count()

  // Click the "+" button to open the fields menu
  await openColumnVisibilityMenu(page)

  // Click the "New field" button to begin field creation
  await page.click(_('new-field-button'))
  await page.waitForSelector(_('add-column-menu'))

  // Name the new column
  await page.keyboard.insertText(name)

  if (type !== 'text') {
    // open the column type picker
    await page.click(_('add-column-type'))
    await page.click(_(`column-type-${type}`))
  }

  if (save) {
    const saveButton = await mustFind(page, _('add-column-modal-save'))
    await saveButton.click()
  }

  if (wait) {
    const newColumnCount = save ? numInitialColumns + 1 : numInitialColumns
    // assert that we have the right number of column headers
    await expect(page.getByRole('columnheader')).toHaveCount(newColumnCount)
  }
}

/**
 * Open the "Columns" visibility menu (i.e. the "+" menu in the top-left of the table view).
 *
 * This method will wait for the menu itself to be visible before it returns.
 *
 * @param page Playwright page object
 */
export async function openColumnVisibilityMenu(page: Page) {
  const visibilityMenuTrigger = await mustFind(page, _('column-visibility-menu-trigger'))
  await visibilityMenuTrigger.click()

  await page.waitForSelector(_('column-visibility-menu'))
}

/**
 * Sets focus on the omnibar footer for a given group
 *
 * @param page Playwright object model
 * @param groupTestId the group's footer to focus
 */
export const focusOnFooterForGroup = async (page: Page, memex: MemexApp, groupTestId: string) => {
  await memex.omnibar.getInputForGroupLocator(groupTestId).focus()
  await expect(memex.omnibar.getInputForGroupLocator(groupTestId)).toBeFocused()
}

/**
 * Creates a draft item for an omnibar footer with focus
 *
 * @param page Playwright object model
 * @param text subject for the draft item
 * @param [activationKey='Enter'] keyboard key used to submit action
 */
export const addDraftItem = async (page: Page, text: string, activationKey = 'Enter', waitForRender = true) => {
  await page.keyboard.type(text)
  await page.keyboard.press(activationKey)
  if (waitForRender) {
    await page.waitForSelector(`text=${text}`)
  }
}

/**
 * Helper to drag a row into a row group
 *
 * @param page Playwright object model
 * @param from src element to drag
 * @param to the target element to drag to
 * @param [options.steps] Sends intermediate `mousemove` events.
 * @param [options.yCoordinateOffset = 5] offset on the y coordinate for the end/target position
 */
export const dragGroupedRow = async (
  page: Page,
  from: Locator,
  to: Locator,
  {steps, yCoordinateOffset = 5}: {steps?: number; yCoordinateOffset?: number} = {},
) => {
  const fromRowDraggerCell = await getTableCell(from, 0)
  const toRowDraggerCell = await getTableCell(to, 0)
  await toRowDraggerCell.scrollIntoViewIfNeeded()

  const {y: toRowY, height: toRowHeight} = await toRowDraggerCell.boundingBox()

  await dragTo(page, fromRowDraggerCell, {y: toRowY + toRowHeight - yCoordinateOffset}, {steps: steps ?? 5})
}

export type CreateItemOptions = {
  expectsRepoCount: number
  targetRepo: string
  itemTitle: string
  waitForRender: boolean
}

export const createItemOptionDefaults = {
  expectsRepoCount: 8,
  targetRepo: 'memex',
  itemTitle: 'integration test fixture',
  waitForRender: true,
}

/**
 * Helper to create an item into the table view
 * Note that this function is not meant to be used standalone as it requires a target input Element to hook into
 *
 * @param page Playwright object model
 * @param options the options needed to create an item in the table view
 * @param [options.expectsRepoCount] the number of items that are expected to appear in the repo-searcher-item
 * @param [options.targetRepo] the repo to create the item in
 * @param [options.itemTitle] the title of the item to create
 */
const createItem = async (page: Page, {expectsRepoCount, targetRepo, itemTitle, waitForRender}: CreateItemOptions) => {
  // Load the repository suggestions.
  await page.keyboard.insertText('#')

  await waitForSelectorCount(page, _('repo-searcher-item'), expectsRepoCount)

  // Filter the list of repository suggestions.
  await page.keyboard.insertText(targetRepo)

  // Wait for the list of suggestions to be filtered.
  await waitForSelectorCount(page, _('repo-searcher-item'), 1)

  // Select the repository
  await page.keyboard.press('Enter')
  await page.waitForSelector(_('issue-picker-list'))

  // Filter the list of issues suggestions.
  await page.keyboard.insertText(itemTitle)
  await waitForSelectorCount(page, _('issue-picker-item'), 1)

  // Select the issue.
  await page.keyboard.press('Enter')

  if (waitForRender) {
    await page.waitForSelector(`text=${itemTitle}`)
  }
}

/**
 * Helper to create an item into the table view from the Omnibar
 *
 * @param page Playwright object model
 * @param options the options needed to create an item in the table view from the omnibar
 * @param [options.expectsRepoCount] the number of items that are expected to appear in the repo-searcher-item
 * @param [options.targetRepo] the repo to create the item in
 * @param [options.itemTitle] the title of the item to create
 * @param [options.waitForRender] should we wait till the item is rendered to the ui
 * @defaults {expectsRepoCount: 8, targetRepo: 'memex', itemTitle: 'integration test fixture', waitForRender: true}
 */
export const createItemFromOmnibar = async (
  page: Page,
  memex: MemexApp,
  options: CreateItemOptions = createItemOptionDefaults,
) => {
  await page.keyboard.press('Control+Space')
  await expect(memex.omnibar.INPUT).toBeFocused()

  await createItem(page, options)
}

/**
 * Helper to create an item into the table view from a Group footer in the table view
 *
 * @param page Playwright object model
 * @param groupTestId when the table has a Group by column applied, this is the name of the group to insert into
 * @param options the options needed to create an item in the table view from the group footer
 * @param [options.expectsRepoCount] the number of items that are expected to appear in the repo-searcher-item
 * @param [options.targetRepo] the repo to create the item in
 * @param [options.itemTitle] the title of the item to create
 * @param [options.waitForRender] should we wait till the item is rendered to the ui
 * @defaults {expectsRepoCount: 8, targetRepo: 'memex', itemTitle: 'integration test fixture', waitForRender: true}
 */
export const createItemFromGroupFooter = async (
  page: Page,
  memex: MemexApp,
  groupTestId: string,
  options: CreateItemOptions = createItemOptionDefaults,
) => {
  await focusOnFooterForGroup(page, memex, groupTestId)
  await createItem(page, options)
}

export async function toggleSliceBy(page: Page, columnName: string) {
  const menuTrigger = await getColumnMenuTrigger(page, columnName)
  await menuTrigger.click()

  await page.click(_('slice-by-trigger'))
}
