import type {ElementHandle, Locator, Page} from '@playwright/test'

import {CellMode} from '../../types/table'
import {mustFind} from '../dom/assertions'
import {containsDOMFocus} from '../dom/interactions'
import {_} from '../dom/selectors'

export function columnHeaderTestId(columnName: string) {
  return `TableColumnHeader{id: ${columnName}}`
}

export function rowTestId(rowIndex: number) {
  return `TableRow{index: ${rowIndex}}`
}

export function cellTestId(rowIndex: number, columnName: string) {
  return `TableCell{row: ${rowIndex}, column: ${columnName}}`
}

export function cellEditorTestId(rowIndex: number, columnName: string) {
  return `TableCellEditor{row: ${rowIndex}, column: ${columnName}}`
}

/**
 * Get the DOM elements for all data rows in the table.
 *
 * This ignores the header and footer rows, and should be used for inspecting
 * table data.
 *
 * @param page Playwright page object
 *
 * @returns Promise resolving an array of table row DOM elements
 */
export function getTableDataRows(page: Page) {
  return page.locator('div[data-testid^=TableRow]').elementHandles()
}

/**
 * Get the count of data rows in the table.
 *
 * This ignores the header and footer rows.
 *
 * @param page Playwright page object
 *
 * @returns Promise resolving an array of table row DOM elements
 */
export async function getRowCountInTable(page: Page) {
  return page.locator('div[data-testid^=TableRow]').count()
}

/**
 * Finds the nth table row
 *
 * @param page Playwright page object
 * @param rowIndex index of the row to select
 *
 * @returns the table row (if found), or throws an error
 */
export async function getTableRow(page: Page, rowIndex: number) {
  const rows = page.getByRole('row')
  const numRows = await rows.count()
  if (numRows === 0) {
    throw new Error(`Could not locate any rows in table`)
  }

  if (rowIndex >= numRows) {
    throw new Error(`Table only has ${numRows} rows, but test requests row at index ${rowIndex}`)
  }

  return rows.nth(rowIndex)
}

/**
 * Finds the nth table cell within a row
 *
 * @param row handle of row to select cell from
 * @param cellIndex index of cell in row to select
 *
 * @returns the table cell (if found), or throws an error
 */
export async function getTableCell(row: Locator, cellIndex: number) {
  const cells = row.getByRole('gridcell')
  if (!cells) {
    throw new Error(`Unable to find any cells in current row`)
  }
  const numCells = await cells.count()
  if (cellIndex >= numCells) {
    throw new Error(`Table row only has ${numCells} cells, but test requested index ${cellIndex}`)
  }
  return cells.nth(cellIndex)
}

/**
 * Retrieves the text of the nth table cell within a row
 *
 * @param row handle of row to select cell from
 * @param cellIndex index of cell in row to select text from
 *
 * @returns the text contents from the cell, or throws if unable to find the cell
 */
export async function getTableCellText(row: Locator, cellIndex: number) {
  const cell = await getTableCell(row, cellIndex)
  return await cell.textContent()
}

/**
 * Finds the nth table column within the first row, or the column with the given name
 *
 * @param page Playwright page object
 * @param identifier the column index within the first row, or the text content of a cell
 */
export async function getTableColumn(page: Page, identifier: number | string) {
  const header = await getTableRow(page, 0)
  const cols = header.getByRole('columnheader')

  if (typeof identifier === 'number') {
    const colCount = await cols.count()
    if (!cols || identifier >= colCount) {
      throw new Error(`Table does not have a column with index ${identifier}`)
    }
    return cols.nth(identifier)
  }
  const nameSpan = page.getByTestId(`${identifier}-column-header-name`)

  const filtered = cols.filter({has: nameSpan})
  if (!filtered) {
    throw new Error(`Unable to find a column with the name ${identifier}`)
  }
  return filtered
}

/**
 * Resolve the column id from a known column header value
 *
 * @param page Playwright page object
 * @param columnName The column header text to locate
 *
 * @returns the column id when a custom column is found
 *
 * This will throw if the column cannot be found, or if a system column is found
 */
export async function getTableColumnId(page: Page, columnName: string): Promise<number> {
  const teamColumn = await getTableColumn(page, columnName)
  const testId = await teamColumn.getAttribute('data-testid')
  const match = /TableColumnHeader{id: (.*)}/.exec(testId)
  const id = match[1]

  const columnId = parseInt(id, 10)
  if (isNaN(columnId)) {
    throw new Error('is not a number')
  }

  return columnId
}

/**
 * Resolve the row index from a known row element
 * by parsing the row's test id.
 *
 * @param row
 *
 * @returns the row index when a row is found
 *
 * This will throw if the row cannot be found
 */
export async function getTableRowIndex(row: ElementHandle | Locator): Promise<number> {
  const testId = await row.getAttribute('data-testid')
  const match = /TableRow{index: (.*)}/.exec(testId)

  if (match == null) {
    throw new Error(`Attribute did not match expected format for TableRow: ${testId}`)
  }

  const index = match[1]

  if (!index) {
    throw new Error('no valid row index found')
  }

  return parseInt(index, 10)
}

/**
 * Retrieves the text of the nth table column within the header
 *
 * @param page Playwright page object
 * @param colIndex the column index to lookup
 */
export async function getTableColumnHeaderName(page: Page, colIndex: number) {
  const col = await getTableColumn(page, colIndex)
  return await col.innerText()
}

/**
 * Retrieve the list of column headers for the current table
 *
 * @param page Playwright page object
 */
export async function getTableColumnHeaderNames(page: Page): Promise<Array<string>> {
  const columnHeaderCellLocators = page.getByRole('columnheader')
  const columnHeaderTextValues = await columnHeaderCellLocators.allInnerTexts()

  const totalCells = columnHeaderTextValues.length
  // ignore the row dragger and add field columns
  return columnHeaderTextValues.slice(1, totalCells - 1)
}

/**
 * Given a selector, determines what mode the cell is in
 *
 * @param page Playwright page object
 * @param selector selector for the cell
 *
 * NOTE: prefer using locator-based version of this function to avoid flaky element handles
 * i.e. memex.tableView.cells.getIssueTypeCell(3).getMode()
 */
export async function getCellMode(page: Page, selector: string) {
  const cell = page.locator(selector)
  return getCellModeFromLocator(page, cell, selector)
}

/**
 * Given a locator determines what mode the cell is in.
 * This is used over getCellMode for roadmap cells, which currently use indexes for test ids,
 * meaning that selectors are not unique for grouped rows, which causes playwright to error. Locators for this case
 * should be scoped to a rowgroup
 *
 * @param page Playwright page object
 * @param cell locator for the cell
 * @param selector selector for the locator to be used in error messages
 */
export async function getCellModeFromLocator(page: Page, cell: Locator, selector: string) {
  const cellElement = await cell.elementHandle()
  if (!cellElement) throw new Error(`Cannot find cell with selector \`${selector}\``)

  const isFocusedInDOM = await containsDOMFocus(page, cellElement)
  const isFocusedState = (await cell.getAttribute('data-test-cell-is-focused')) === 'true'
  const isEditingState = (await cell.getAttribute('data-test-cell-is-editing')) === 'true'
  const isSuspendedState = (await cell.getAttribute('data-test-cell-is-suspended')) === 'true'

  if (!isFocusedInDOM && !isFocusedState && !isEditingState && !isSuspendedState) {
    return CellMode.DEFAULT
  } else if (isFocusedInDOM && isFocusedState && !isEditingState && !isSuspendedState) {
    return CellMode.FOCUSED
  } else if (isFocusedInDOM && isFocusedState && isEditingState) {
    return CellMode.EDITING
  } else if (!isFocusedInDOM && isFocusedState && isEditingState && isSuspendedState) {
    // We intentionally return `CellMode.EDITING` in this case too, because the suspended focus
    // state corresponds to editing a cell via a modal dialog.
    return CellMode.EDITING
  } else {
    throw new Error(`
Cell with selector ${selector} is in an undefined state
    isFocusedInDOM: ${isFocusedInDOM}
    isFocusedState: ${isFocusedState}
    isEditingState: ${isEditingState}
    isSuspendedState: ${isSuspendedState}
`)
  }
}

export async function getOmnibarHasFocus(page: Page, omnibar: Locator) {
  const omnibarElement = await omnibar.elementHandle()

  const input = await omnibar.locator('input').elementHandle()
  const isFocusedInDOM = await containsDOMFocus(page, input)

  const hasFocusClass = (await omnibarElement.getAttribute('class')).includes('is-focused')
  return isFocusedInDOM && hasFocusClass
}

/**
 * Get the count of all item rows within a group of the table;
 * excludes the omnibar row
 *
 * @param page Playwright page object
 * @param groupName group header to find in table
 * @returns The number of items in the group
 */
export async function getItemRowCountWithinGroup(page: Page, groupName: string) {
  const rowCountWithOmnibar = (await getTableRowsWithinGroup(page, groupName)).count()
  return (await rowCountWithOmnibar) - 1
}

/**
 * Get the DOM elements of all rows within a group of the table
 *
 * @param page Playwright page object
 * @param groupName group header to find in table
 */
async function getTableRowsWithinGroup(page: Page, groupName: string) {
  await mustFind(page, _(`table-group-${groupName}`))

  return page.getByTestId(`table-group-${groupName}`).getByRole('row')
}

/**
 * Get the DOM element for a particular row within a group of the table
 *
 * @param page Playwright page object
 * @param groupName group header to find in table
 * @param rowIndex index of row in group
 */
export async function getTableRowWithinGroup(page: Page, groupName: string, rowIndex: number) {
  const rows = await getTableRowsWithinGroup(page, groupName)

  if (!rows || rowIndex >= (await rows.count())) {
    throw new Error(`React-table does not have a row with index ${rowIndex}`)
  }
  return rows.nth(rowIndex)
}

/**
 * Get the index of the last row in the table
 *
 * @param page Playwright page object
 */
export async function getLastRowIndexOfTable(page: Page): Promise<number> {
  const rows = await getTableDataRows(page)
  if (rows.length === 0) {
    throw new Error('No data rows were found in table')
  }

  const lastRow = rows[rows.length - 1]
  return getTableRowIndex(lastRow)
}

/**
 * Get the last column of the table
 *
 * @param page Playwright page object
 */
export async function getLastColumnOfTable(page: Page): Promise<string> {
  const columns = await getTableColumnHeaderNames(page)
  if (columns.length === 0) {
    throw new Error('No columns were found in table')
  }

  const lastColumnName = columns[columns.length - 1]
  if (!lastColumnName) {
    throw new Error('Unable to get last column name in table')
  }

  return lastColumnName
}

export const getRowTitle = async (row: Locator) => {
  const titleCell = await getTableCell(row, 1)
  return (await titleCell.innerText()).trim()
}

export const getRow = async (page: Page, selector: string) => {
  // eslint-disable-next-line playwright/no-element-handle
  const row = await page.$(selector)
  if (!row) throw new Error(`Row not found for selector ${selector}`)
  return row
}

export const getRows = async (page: Page, ids: Array<number>) => {
  return await Promise.all(ids.map(id => getRow(page, _(rowTestId(id)))))
}

export const getRowSelectionState = async (row: ElementHandle | Locator) => {
  return (await row.getAttribute('data-test-row-is-selected')) === 'true'
}

export const getRowSelectionStates = async (rows: Array<ElementHandle | Locator>) => {
  return Promise.all(rows.map(row => getRowSelectionState(row)))
}

/**
 * Get the titles for all rows in a table group
 *
 * @param page Playwright page object
 * @param groupName group name to locate in the table
 */
export async function getRowTitlesWithinGroup(page: Page, groupName: string) {
  const rows = await getTableRowsWithinGroup(page, groupName)
  const count = await rows.count()
  const titles = []
  for (let i = 0; i < count - 1; i++) {
    const row = rows.nth(i)
    titles.push(getRowTitle(row))
  }
  return Promise.all(titles)
}

export type TableGroup = {
  name: string
  testId: string
}

/**
 * Get the titles for all groups in the current table
 *
 * @param page Playwright page object
 */
export async function getTableGroups(page: Page): Promise<Array<TableGroup>> {
  const groupTitlesLocator = page.getByTestId('table-scroll-container').locator('role=rowgroup')

  const elements = await groupTitlesLocator.elementHandles()

  const groups = new Array<TableGroup>()

  for (const element of elements) {
    // eslint-disable-next-line no-restricted-syntax
    const groupName = await element.$(_('group-name'))
    const name = await groupName.textContent()
    const testIdValue = await element.getAttribute('data-testid')
    const testId = testIdValue.replace('table-group-', '')
    groups.push({name, testId})
  }

  return groups
}

export async function getGroupNamesInTable(page: Page) {
  const groups = await getTableGroups(page)
  return groups.map(g => g.name)
}

/**
 * Get the subtitles for all groups in the current table
 *
 * @param page Playwright page object
 */
export function getGroupSubtitlesInTable(page: Page): Promise<Array<string>> {
  const groupSubtitleElements = page.getByTestId('group-name-subtitle')
  return groupSubtitleElements.allTextContents()
}

/**
 * Gets the group header element time element datetime attributes
 * tor false, if there is none
 */
export async function getGroupSubtitleDatesInTable(page: Page) {
  // eslint-disable-next-line playwright/no-element-handle
  const groupSubtitleElements = await page.$$(_('group-name-subtitle'))

  const groups = new Array<{startDate: string; endDate: string} | false>()

  for (const elm of groupSubtitleElements) {
    // eslint-disable-next-line no-restricted-syntax
    const timeEls = await elm.$$('time')
    const [startTimeEl, endTimeEl] = timeEls
    if (startTimeEl && endTimeEl) {
      groups.push({
        startDate: await startTimeEl.getAttribute('datetime'),
        endDate: await endTimeEl.getAttribute('datetime'),
      })
    } else {
      groups.push(false)
    }
  }

  return groups
}

type TitleTextParts = {
  name: string
  number: string
}

/**
 * Get the title text parts (name and number) for a row in the table
 *
 * @param page Playwright page object
 * @param rowIndex: the index of the row to get the title text
 */
export async function getTitleTextParts(page: Page, rowIndex: number): Promise<TitleTextParts> {
  const titleSelector = _(cellTestId(rowIndex, 'Title'))
  const cellText = await page.textContent(titleSelector)
  const number = cellText.match(/ #[0-9]*$/)?.[0] || ''
  const name = cellText.substring(0, cellText.length - number.length)
  return {name, number}
}

/**
 * Get the dropdown caret inside a cell to expand the select menu
 *
 * @param page Playwright page object
 * @param testCellId selector corresponding to the cell under test
 */
export async function getDropdownCaret(page: Page, testCellId: string) {
  const cell = await mustFind(page, testCellId)
  const caret = await mustFind(cell, 'button')
  return caret
}

/**
 * Get the rankings of each row in a given group
 *
 * @param page Playwright page object
 * @param groupName group to locate in table
 *
 * @returns Array of strings representing the priority column as shown to the user
 */
export async function getRowRankingsWithinGroup(page: Page, groupName: string) {
  const rows = await getTableRowsWithinGroup(page, groupName)
  const count = await rows.count()
  const rankings = []
  for (let i = 0; i < count - 1; i++) {
    const row = rows.nth(i)
    rankings.push(getRowRanking(row))
  }
  return Promise.all(rankings)
}

async function getRowRanking(row: Locator) {
  const titleCell = await getTableCell(row, 0)
  return await titleCell.innerText()
}

/**
 *  Locate the input element associated with a cell editor
 *
 * @param page Playwright page object
 * @param testCellId cell identifier element

 */
export async function getEditorInput(page: Page, testCellId: string): Promise<ElementHandle<HTMLInputElement>> {
  // eslint-disable-next-line playwright/no-element-handle
  const input = await page.$(`${testCellId} input`)
  if (!input) throw new Error(`Could not find  editor input for selector: '${testCellId}'`)
  return input as ElementHandle<HTMLInputElement>
}

/**
 * List the column visibility options under the Add Column menu.
 *
 * This assumes the menu is visible, and the test should click on the
 * `data-testid=column-visibility-menu-trigger` element before calling this
 * method.
 *
 * @param page Playwright page object
 *
 * @returns Array of strings representing the button text
 */
export function getColumnVisibilityMenuOptions(page: Page): Promise<Array<string>> {
  return page.getByTestId('column-visibility-menu').getByRole('menuitemcheckbox').allTextContents()
}

/**
 * Locate the DOM element for a given column in the Add Column menu, where the
 * existing columns (including invisible columns).
 *
 * This assumes the menu is visible, and the test should click on the
 * `data-testid=column-visibility-menu-trigger` element before calling this
 * method.
 *
 * This method will error if it cannot find a button matching this column name.
 *
 * @param page Playwright page object
 * @param columnName column name to locate
 *
 * @returns Array of strings representing the button text
 */
export function getColumnVisibilityMenuOption(page: Page, columnName: string) {
  return page.getByTestId('column-visibility-menu').getByRole('menuitemcheckbox', {name: columnName})
}

/**
 * Locates the omnibar footer for a given group
 *
 * @param page Playwright object model
 * @param groupTestId the group's footer test id to interact with
 */
export const getFooterInputForGroup = async (page: Page, groupTestId: string) => {
  const element = await mustFind(page, _(`table-group-footer-${groupTestId}`))
  // eslint-disable-next-line no-restricted-syntax
  const input = await element.$('input')
  if (!input) {
    throw new Error(`Could not find input element within group footer ${groupTestId}`)
  }
  return input
}

/**
 * Resolve the test id from a particular row within a group of the table
 *
 * @param page Playwright page object
 * @param groupName group header to find in table
 * @param rowIndex index of row in group
 *
 * @returns The row's test identifier as a number
 *
 * This will throw if the row cannot be found
 */
export async function getTableIndexForRowInGroup(page: Page, groupName: string, rowIndex: number): Promise<number> {
  const row = await getTableRowWithinGroup(page, groupName, rowIndex)
  return getTableRowIndex(row)
}
