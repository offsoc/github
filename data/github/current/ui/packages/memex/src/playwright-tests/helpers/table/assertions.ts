import {type ElementHandle, expect, type Page} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {ItemType} from '../../types/board'
import type {HTMLOrSVGElementHandle} from '../../types/dom'
import type {MemexProjectColumnId} from '../../types/table'
import {SLICE_BY_COLUMN_ID_KEY, SLICE_VALUE_KEY, SORTED_BY_COLUMN_ID_KEY} from '../../types/url'
import {mustFind, mustNotFind, waitForSelectorCount} from '../dom/assertions'
import {_} from '../dom/selectors'
import {cellTestId, getTableCell, getTableColumnHeaderName, getTableRow} from './selectors'

/**
 * Assert that the current table is empty
 *
 * @param page Playwright page object
 */
export async function waitForEmptyTable(page: Page) {
  await waitForRowCount(page, 0)
}

/**
 * Utility method for asserting that there are a specific number of rows for the table
 *
 * @param page Playwright page object
 * @param count expected number of items in the table
 */
export async function waitForRowCount(page: Page, count: number) {
  // We add 2 to account for the header and footer rows
  await expect(page.getByRole('row')).toHaveCount(2 + count)
}

/**
 * Assert the table is sorted by a particular column
 *
 * @param page Playwright page object
 * @param columnName column name to inspect for the sorting hint
 */
export async function isSortedBy(page: Page, columnName: string | MemexProjectColumnId) {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  await mustFind(page, _(`sorted-label-${columnName}`))
}

/**
 * Assert the table is _not_ sorted by a particular column
 *
 * @param page Playwright page object
 * @param columnName column name to inspect for the sorting hint
 */
export async function isNotSortedBy(page: Page, columnName: string | MemexProjectColumnId) {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  await mustNotFind(page, _(`sorted-label-${columnName}`))
}

/**
 * Ensure a select menu is visible to the current test.
 *
 * This will wait for up to 2 seconds before timing out.
 *
 * @param menu an element that should be active on the page
 */
export async function selectMenuOptionsAreLoaded(menu: HTMLOrSVGElementHandle) {
  await menu.waitForSelector(`[role=option][aria-selected="false"]`, {timeout: 2000})
}

/**
 * Assert that the sorted by column URL param matches the expected value
 *
 * @param page Playwright page object
 * @param paramValue expected sort columns
 */
export function expectSortedByColumnIdUrlParam(page: Page, paramValue: Array<string>) {
  const url = new URL(page.url())
  expect(url.searchParams.getAll(SORTED_BY_COLUMN_ID_KEY)).toEqual(paramValue)
}

/**
 * Assert that the slice by column URL param matches the expected value
 *
 * @param page Playwright page object
 * @param paramValue expected slice column
 */
export function expectSliceByColumnIdUrlParam(page: Page, paramValue: string | null) {
  const url = new URL(page.url())
  expect(url.searchParams.get(SLICE_BY_COLUMN_ID_KEY)).toBe(paramValue)
}

/**
 * Assert that the slice value URL param matches the expected value
 *
 * @param page Playwright page object
 * @param paramValue expected slice value
 */
export function expectSliceValueUrlParam(page: Page, paramValue: string | null) {
  const url = new URL(page.url())
  expect(url.searchParams.get(SLICE_VALUE_KEY)).toBe(paramValue)
}

/**
 * Helper function for asserting a row exists and that it contains the correct
 * number of rows.
 *
 * Do not include the "footer" in the expected `rowCount` as this is handled
 * internally.
 */
export async function expectGroupHasRows(page: Page, groupName: string, rowCount: number) {
  await mustFind(page, _(`group-header-${groupName}`))

  const expectedRowCount = rowCount + 1
  await waitForSelectorCount(page, `${_(`table-group-${groupName}`)} [role="row"]`, expectedRowCount)
  await mustFind(page, _(`table-group-footer-${groupName}`))
}

/**
 * Assert that the current table is grouped by a particular column, and that a particular group is visible
 *
 * @param page Playwright page object
 * @param columnName column name used for grouping
 * @param groupName expected group name to be visible as header
 */
export async function isGroupedBy(page: Page, columnName: string | MemexProjectColumnId, groupName: string) {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  await mustFind(page, _(`grouped-label-${columnName}`))
  await mustFind(page, _(`group-header-${groupName}`))
}

/**
 * Assert that the current table is NOT grouped by a particular column, and that a particular group is NOT visible
 *
 * @param page Playwright page object
 * @param columnName column name previously used for grouping
 * @param groupName expected group name to be NOT visible as header
 */
export async function isNotGroupedBy(page: Page, columnName: string | MemexProjectColumnId, groupName: string) {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  await mustNotFind(page, _(`grouped-label-${columnName}`))
  await groupMustNotExist(page, groupName)
}

/**
 * Assert that a particular group is not present in the table
 *
 * @param page Playwright page object
 * @param groupName group name that should not be visible
 */
export async function groupMustNotExist(page: Page, groupName: string) {
  await mustNotFind(page, _(`group-header-${groupName}`))
}

/**
 * Assert that a particular group has been collapsed
 *
 * @param page Playwright page object
 * @param groupName group name to find in table
 */
export async function expectGroupIsCollapsed(page: Page, groupName: string) {
  await mustFind(page, _(`group-header-${groupName}`))
  await mustNotFind(page, _(`table-group-footer-${groupName}`))
}

/**
 * Assert the row at a given index is the expected type
 *
 * @param page Playwright page object
 * @param rowIndex index of row
 * @param itemType expected row type
 *
 * This function avoids looking up the item data, and instead checks the DOM
 * for details about the card. Changes to the DOM will likely impact this test.
 */
export async function assertRowMatchesType(page: Page, rowIndex: number, itemType: ItemType) {
  const row = await getTableRow(page, rowIndex)
  const rowTitle = await getTableCell(row, 1)

  switch (itemType) {
    case ItemType.RedactedItem: {
      const span = rowTitle.locator('span')
      const text = await span.textContent()
      expect(text).toEqual("You don't have permission to access this item")
      break
    }
    case ItemType.Issue: {
      const icon = rowTitle.locator('svg')
      const label = await icon.getAttribute('aria-label')
      test.fail(
        label !== 'Open issue' && label !== 'Closed issue',
        `Expected label to mention issue, but instead found '${label}'`,
      )
      break
    }
    case ItemType.PullRequest: {
      const icon = rowTitle.locator('svg')
      const label = await icon.getAttribute('aria-label')
      test.fail(
        label !== 'Open pull request' && label !== 'Closed pull request',
        `Expected label to mention pull request, but instead found '${label}'`,
      )
      break
    }
    case ItemType.DraftIssue: {
      const icon = rowTitle.locator('svg')
      const label = await icon.getAttribute('aria-label')
      expect(label).toEqual('Draft issue')
    }
  }
}

/**
 * Assert the options for the cell editor are loaded
 *
 * @param menu the menu element which should be visible on the page
 */
export async function optionsAreLoaded(menu: HTMLOrSVGElementHandle) {
  await menu.waitForSelector(`[role=option][aria-selected="false"]`, {timeout: 2000})
}

/**
 * Assert that a validation message is associated with the given input
 *
 * @param page Playwright page object
 * @param input input element being edited by the user
 * @param message expected message to see in validation DOM element
 */
export async function expectValidationMessage(page: Page, input: ElementHandle<HTMLInputElement>, message: string) {
  const validationMessageId = await input.getAttribute('aria-describedby')
  expect(await page.textContent(`#${validationMessageId}`)).toEqual(message)
}

/**
 * Assert that a given column header is not visible in the table
 *
 * @param page Playwright page object
 * @param name column name that should not be present
 */
export async function expectColumnToBeHidden(page: Page, name: string) {
  const header = await getTableRow(page, 0)
  const columnHeaderNames = await header.locator('[role="columnheader"]').allTextContents()

  for (const headerName of columnHeaderNames) {
    expect(headerName).not.toEqual(name)
  }
}

/**
 * Assert that the expected column header exists at this index in the table
 *
 * @param page Playwright page object
 * @param index index in table column array to check
 * @param name expected name
 */
export async function expectColumnHeaderName(page: Page, index: number, name: string) {
  const actual = await getTableColumnHeaderName(page, index)
  expect(actual).toBe(name)
}

/**
 * Helper function for asserting a row exists and that it contains the correct
 * number of rows.
 *
 * Do not include the "footer" in the expected `rowCount` as this is handled
 * internally.
 */
export async function expectGroupHasRowCount(page: Page, groupName: string, rowCount: number) {
  await mustFind(page, _(`group-header-${groupName}`))

  const expectedRowCount = rowCount + 1
  await waitForSelectorCount(page, `${_(`table-group-${groupName}`)} [role="row"]`, expectedRowCount)
  await mustFind(page, _(`table-group-footer-${groupName}`))
}

/**
 * Assert the row drag handle is visible in the DOM
 *
 * @param page Playwright object model
 * @param rowIndex item index to locate
 *
 * @returns boolean indicating whether the row-drag-handle element is visible for the given row
 */
export function rowDragHandleIsVisible(page: Page, rowIndex: number) {
  return page.isVisible(_(cellTestId(rowIndex, 'row-drag-handle')))
}

/**
 * Assert that the current table is sliced by a particular column
 *
 * @param page Playwright page object
 * @param columnName column name used for slicing
 */
export async function isSlicedBy(page: Page, columnName: string) {
  await expect(page.getByTestId('slicer-panel-title')).toHaveAttribute('title', columnName)
  await expect(page.getByTestId('slicer-panel')).toBeVisible()
  await mustFind(page, _(`sliced-label-${columnName}`))
}

/**
 * Assert that the current table is no sliced by a column
 *
 * @param page Playwright page object
 */
export async function isNotSlicedBy(page: Page) {
  await expect(page.getByTestId('slicer-panel')).toBeHidden()
  await expect(page.getByTestId('slicer-panel-title')).toBeHidden()
}
