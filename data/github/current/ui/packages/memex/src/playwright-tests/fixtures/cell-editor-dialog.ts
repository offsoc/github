import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'

export class CellEditorDialog extends BasePageViewWithMemexApp {
  // Only one editor will be visible at a time. Use generic QA selector, as
  // we do not know the ids of newly created custom columns to make a full selector - i.e TableCellEditor{row:0 column 22}
  EDITOR = this.page.getByTestId(/TableCellEditor{row:/)
  OPTIONS = this.EDITOR.getByTestId('table-cell-editor-row')
  EMPTY_ROW = this.EDITOR.getByTestId('table-cell-editor-empty-row')
  ADD_OPTION = this.EDITOR.getByTestId('add-column-option')
  ERROR = this.EDITOR.getByTestId('table-cell-editor-error')

  public async expectToBeVisible() {
    return expect(this.EDITOR).toBeVisible()
  }

  public async expectToBeHidden() {
    return expect(this.EDITOR).toBeHidden()
  }

  async expectOptionsCount(count: number) {
    await expect(this.OPTIONS).toHaveCount(count)
  }

  public getOption(option: string) {
    return this.OPTIONS.getByText(option)
  }

  public getTextInput() {
    return this.EDITOR.getByRole('textbox')
  }

  public filterOptions(text: string) {
    return this.getTextInput().fill(text)
  }

  public selectOption(text: string) {
    return this.getOption(text).click()
  }

  async expectInputFocused() {
    return expect(this.getTextInput()).toBeFocused()
  }

  async expectInputValue(text: string) {
    return expect(this.getTextInput()).toHaveValue(text)
  }

  async expectErrorMessage(text: string) {
    return expect(await this.ERROR.textContent()).toBe(text)
  }
}
