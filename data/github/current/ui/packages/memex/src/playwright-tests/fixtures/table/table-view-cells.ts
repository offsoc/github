import {expect, type Locator, type Page} from '@playwright/test'

import {MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import {cellTestId} from '../../helpers/table/selectors'
import {CellMode} from '../../types/table'
import {BasePageView} from '../base-page-view'
import {AssigneesTableCell} from '../fields/assignees'
import {LinkedPullRequestsTableCell} from '../fields/linked-prs'
import {ReviewersTableCell} from '../fields/reviewers'
import {TracksTableCell} from '../fields/tracks'

// We have to carefully ensure we don't accidentally click the link for title
// cells, or the header resize handler.
const CELL_CLICK_POINT = {x: 10, y: 5}

export class TableViewCells extends BasePageView {
  protected root: Locator

  constructor(page: Page, root: Locator) {
    super(page)
    this.root = root
  }

  public getCellLocator(rowIndex: number, fieldName: string) {
    return this.root.getByTestId(cellTestId(rowIndex, fieldName))
  }

  public getGenericCell(rowIndex: number, fieldName: string) {
    const cellLocator = this.getCellLocator(rowIndex, fieldName)
    return new TableCell(cellLocator)
  }

  public getTypedCell<T extends MemexColumnDataType>(rowIndex: number, fieldName: string, columnType: T) {
    const cellLocator = this.getCellLocator(rowIndex, fieldName)
    return new TableCellTypeLookup[columnType](cellLocator) as InstanceType<
      (typeof TableCellTypeLookup)[typeof columnType]
    >
  }

  public getLinkedPullRequestsCell(rowIndex: number) {
    return this.getTypedCell(rowIndex, 'Linked pull requests', MemexColumnDataType.LinkedPullRequests)
  }

  public getReviewersCell(rowIndex: number) {
    return this.getTypedCell(rowIndex, 'Reviewers', MemexColumnDataType.Reviewers)
  }

  public getTracksCell(rowIndex: number) {
    return this.getTypedCell(rowIndex, 'Tracks', MemexColumnDataType.Tracks)
  }

  public getAssigneesCell(rowIndex: number) {
    return this.getTypedCell(rowIndex, 'Assignees', MemexColumnDataType.Assignees)
  }

  public getIssueTypeCell(rowIndex: number) {
    return this.getTypedCell(rowIndex, 'Type', MemexColumnDataType.IssueType)
  }

  public getParentIssueCell(rowIndex: number) {
    return this.getTypedCell(rowIndex, 'Parent issue', MemexColumnDataType.ParentIssue)
  }

  public getSubIssuesProgressCell(rowIndex: number) {
    return this.getTypedCell(rowIndex, 'Sub-issues progress', MemexColumnDataType.SubIssuesProgress)
  }

  public setCellToEditMode(rowIndex: number, fieldName: string) {
    const cell = this.getGenericCell(rowIndex, fieldName)
    return cell.locator.dblclick({position: CELL_CLICK_POINT})
  }
}

export class TableCell {
  public readonly locator: Locator
  public readonly FILL_HANDLE: Locator
  public readonly DROPDOWN_BUTTON: Locator
  private readonly PLACEHOLDER: Locator

  constructor(cellLocator: Locator) {
    this.locator = cellLocator
    this.FILL_HANDLE = this.locator.getByTestId('table-cell-fill-handle')
    this.PLACEHOLDER = this.locator.getByTestId('placeholder')
    this.DROPDOWN_BUTTON = this.locator.getByTestId('dropdown-button')
  }

  public expectLoading() {
    return expect(this.PLACEHOLDER).toBeVisible()
  }

  public expectLoaded() {
    return expect(this.PLACEHOLDER).toBeHidden()
  }

  public expectText(expectedText: string | RegExp) {
    return expect(this.locator).toHaveText(expectedText)
  }

  public setToEditMode() {
    return this.locator.dblclick({position: CELL_CLICK_POINT})
  }

  public setToFocusMode() {
    return this.locator.click({position: CELL_CLICK_POINT})
  }

  public async expectContainsFocus() {
    return await this.locator.evaluate(node => {
      return node === document.activeElement || node.contains(document.activeElement)
    })
  }

  public async getMode() {
    const isFocusedInDOM = await this.expectContainsFocus()
    const isFocusedState = (await this.locator.getAttribute('data-test-cell-is-focused')) === 'true'
    const isEditingState = (await this.locator.getAttribute('data-test-cell-is-editing')) === 'true'
    const isSuspendedState = (await this.locator.getAttribute('data-test-cell-is-suspended')) === 'true'

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
      Cell is in an undefined state
          isFocusedInDOM: ${isFocusedInDOM}
          isFocusedState: ${isFocusedState}
          isEditingState: ${isEditingState}
          isSuspendedState: ${isSuspendedState}
      `)
    }
  }

  public async expectDefault() {
    return expect(await this.getMode()).toBe(CellMode.DEFAULT)
  }

  public async expectFocused() {
    return expect(await this.getMode()).toBe(CellMode.FOCUSED)
  }

  public async expectEditing() {
    return expect(await this.getMode()).toBe(CellMode.EDITING)
  }

  public async expectReadonly() {
    return expect(this.locator).toHaveClass(/cursor-not-allowed/)
  }

  public async expectEditable() {
    return expect(this.locator).not.toHaveClass(/cursor-not-allowed/)
  }
}

export const TableCellTypeLookup = {
  [MemexColumnDataType.Assignees]: AssigneesTableCell,
  [MemexColumnDataType.Date]: TableCell,
  [MemexColumnDataType.Iteration]: TableCell,
  [MemexColumnDataType.Labels]: TableCell,
  [MemexColumnDataType.LinkedPullRequests]: LinkedPullRequestsTableCell,
  [MemexColumnDataType.Milestone]: TableCell,
  [MemexColumnDataType.Number]: TableCell,
  [MemexColumnDataType.ParentIssue]: TableCell,
  [MemexColumnDataType.Repository]: TableCell,
  [MemexColumnDataType.Reviewers]: ReviewersTableCell,
  [MemexColumnDataType.SingleSelect]: TableCell,
  [MemexColumnDataType.SubIssuesProgress]: TableCell,
  [MemexColumnDataType.Text]: TableCell,
  [MemexColumnDataType.Title]: TableCell,
  [MemexColumnDataType.TrackedBy]: TableCell,
  [MemexColumnDataType.Tracks]: TracksTableCell,
  [MemexColumnDataType.IssueType]: TableCell,
}
