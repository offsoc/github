import {expect, type Page} from '@playwright/test'

import {AddFieldDialog} from './add-field-dialog'
import {BasePageViewWithMemexApp} from './base-page-view'
import {CellEditorDialog} from './cell-editor-dialog'
import type {MemexApp} from './memex-app'
import {TableViewCells} from './table/table-view-cells'
import {TableViewColumns} from './table/table-view-columns'
import {TableViewRows} from './table/table-view-rows'

export class TableView extends BasePageViewWithMemexApp {
  addField: AddFieldDialog
  cellEditor: CellEditorDialog
  TABLE_ROOT = this.page.getByTestId('table-root')
  cells: TableViewCells
  columns: TableViewColumns
  rows: TableViewRows

  constructor(page: Page, memex: MemexApp) {
    super(page, memex)

    this.addField = new AddFieldDialog(page, memex)
    this.cellEditor = new CellEditorDialog(page, memex)
    this.cells = new TableViewCells(page, this.TABLE_ROOT)
    this.columns = new TableViewColumns(page, this.TABLE_ROOT)
    this.rows = new TableViewRows(page, this.TABLE_ROOT)
  }

  TABLE_CONTAINER = this.page.getByTestId('table-scroll-container')
  /** Get the button to activate the group actions menu button */
  GROUP_MENU_TRIGGER = (groupName: string) => this.page.getByRole('button', {name: `Actions for group: ${groupName}`})
  GROUP_MENU = (groupName: string) => this.page.getByRole('menu', {name: `Actions for group: ${groupName}`})

  public async expectVisible() {
    return expect(this.TABLE_ROOT).toBeVisible()
  }

  public async expectContainsFocus(focusInTable: boolean) {
    const containsActiveElement = await this.TABLE_ROOT.evaluate(node => {
      return node.contains(document.activeElement)
    })

    expect(containsActiveElement).toBe(focusInTable)
  }
}
