import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import {Role} from '../../../client/api/common-contracts'
import type {DraftIssue} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {cellTestId, rowTestId} from '../../../client/components/react_table/test-identifiers'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {setupTableView} from '../../test-app-wrapper'

const CellMode = {
  DEFAULT: 'DEFAULT',
  FOCUSED: 'FOCUSED',
  EDITING: 'EDITING',
} as const
type CellMode = ObjectValues<typeof CellMode>
/**
 * Given a cell, determine if it is in the expected mode
 *
 * @param cell
 * @param expectedCellMode
 */
function expectCellModeToBe(cell: HTMLElement, expectedCellMode: CellMode) {
  const isFocusedState = cell.getAttribute('data-test-cell-is-focused') === 'true'
  const isEditingState = cell.getAttribute('data-test-cell-is-editing') === 'true'
  const isSuspendedState = cell.getAttribute('data-test-cell-is-suspended') === 'true'

  let cellMode
  if (!isFocusedState && !isEditingState && !isSuspendedState) {
    cellMode = CellMode.DEFAULT
  } else if (isFocusedState && !isEditingState && !isSuspendedState) {
    cellMode = CellMode.FOCUSED
  } else if (isFocusedState && isEditingState) {
    cellMode = CellMode.EDITING
  } else {
    throw new Error(`
    Cell ${cell.getAttribute('data-testid')} is in an undefined state
    isFocusedState: ${isFocusedState}
    isEditingState: ${isEditingState}
    isSuspendedState: ${isSuspendedState}
    `)
  }

  if (expectedCellMode === CellMode.DEFAULT) {
    expect(cell).not.toHaveFocus()
  } else if (expectedCellMode === CellMode.FOCUSED) {
    expect(cell).toHaveFocus()
  }

  expect(cellMode).toEqual(expectedCellMode)
}

export function buildRows(itemsCount: number) {
  const items: Array<DraftIssue> = []

  for (let i = 0; i < itemsCount; i++) {
    const memexProjectColumnValues = [columnValueFactory.title(`Cell ${items.length + 1}`, ItemType.DraftIssue).build()]

    items.push(
      draftIssueFactory.build({
        memexProjectColumnValues,
      }),
    )
  }
  return items
}

/**
 * Builds a table view with the given number of rows.
 * @param itemsCount the number of items within the table
 * @param columns the columns to be displayed in the view
 */
export function renderTableWithRows(itemsCount: number, columns: Array<MemexColumn>) {
  const items = buildRows(itemsCount)
  const {Table} = setupTableView({
    items,
    columns,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  })
  render(<Table />)
}

export async function expectOmnibarToHaveFocus(groupName?: string) {
  const omnibar = await findOmnibarElement(groupName)
  expect(omnibar).toHaveFocus()
}

export async function getCell(columnName: string, rowIndex: number) {
  return await screen.findByTestId(cellTestId(rowIndex, columnName))
}

export async function expectCellNotToHaveFocus(columnName: string, rowIndex: number) {
  const cell = await getCell(columnName, rowIndex)
  expectCellModeToBe(cell, CellMode.DEFAULT)
}

export async function expectCellToHaveFocus(columnName: string, rowIndex: number) {
  const cell = await getCell(columnName, rowIndex)
  expectCellModeToBe(cell, CellMode.FOCUSED)
}

export async function expectCellToBeBulkSelected(columnName: string, rowIndex: number) {
  const cell = await getCell(columnName, rowIndex)
  expect(cell).toHaveAttribute('aria-selected', 'true')
}

export async function expectCellNotToBeBulkSelected(columnName: string, rowIndex: number) {
  const cell = await getCell(columnName, rowIndex)
  expect(cell).not.toHaveAttribute('aria-selected', 'true')
}

export async function expectCellToBeInEditingMode(columnName: string, rowIndex: number) {
  const cell = await getCell(columnName, rowIndex)
  expectCellModeToBe(cell, CellMode.EDITING)
}

export async function expectColumnMenuButtonToHaveFocus(columnName: string) {
  const columnMenuButton = await screen.findByTestId(`${columnName}-column-menu-trigger`)
  expect(columnMenuButton).toHaveFocus()
}

export async function expectRowMenuButtonToHaveFocus(rowIndex: number) {
  const row = await screen.findByTestId(rowTestId(rowIndex))
  const rowMenuButton = await within(row).findByTestId('row-menu-trigger')
  expect(rowMenuButton).toHaveFocus()
}

export async function expectGroupCollapseButtonToHaveFocus(groupName: string) {
  const groupCollapseButton = await screen.findByLabelText(`Collapse group ${groupName}`)
  expect(groupCollapseButton).toHaveFocus()
}

export async function expectGroupMenuButtonToHaveFocus(groupName: string) {
  const groupCollapseButton = await screen.findByRole('button', {name: `Actions for group: ${groupName}`})
  expect(groupCollapseButton).toHaveFocus()
}

export async function clickCell(columnName: string, rowIndex: number) {
  const cell = await getCell(columnName, rowIndex)
  await userEvent.click(cell)
}

export async function clickCellWithKeyHeld(columnName: string, rowIndex: number, key: string) {
  const cell = await getCell(columnName, rowIndex)
  const keyboardState = await userEvent.keyboard(`{${key}>}`, {skipAutoClose: true})
  await userEvent.click(cell, {keyboardState})
  await userEvent.keyboard(`{/${key}}`)
}

export async function focusColumnMenuButton(columnName: string) {
  const columnMenuButton = await screen.findByTestId(`${columnName}-column-menu-trigger`)
  columnMenuButton.focus()
}

export async function clickOmnibar(groupName?: string) {
  const omnibar = await findOmnibarElement(groupName)
  await userEvent.click(omnibar)
}

export async function clickColumnHeaderOptions(name: string) {
  const button = await screen.findByRole('button', {name: `${name} column options`})
  return userEvent.click(button)
}

async function findOmnibarElement(groupName?: string) {
  const container = groupName
    ? await screen.findByTestId(`table-group-footer-${groupName}`)
    : await screen.findByTestId('table-root')
  return await within(container).findByTestId('repo-searcher-input')
}
