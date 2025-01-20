import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'
import {EditOptionDialog} from './edit-option-dialog'

/**
 * The top-level form for editing single-select values. Can appear on the settings page or
 * in the add-field dialog.
 */
export class SingleSelectForm extends BasePageViewWithMemexApp {
  editOptionDialog = new EditOptionDialog(this.page, this.memex)

  /** Container element for an entire option row. */
  OPTION = this.page.getByTestId('singleSelectItem')

  OPTION_DRAG_HANDLE = this.page.getByTestId('sortable-trigger')

  OPTION_LABEL = this.OPTION.getByTestId('single-select-token')
  REMOVE_OPTION_BUTTON = this.page.getByTestId('single-select-item-delete-button')
  EDIT_OPTION_BUTTON = this.page.getByTestId('single-select-item-edit-button')

  NEW_OPTION_GROUP = this.page.getByRole('group', {name: 'Add option'})
  NEW_OPTION_INPUT = this.NEW_OPTION_GROUP.getByRole('textbox', {name: 'Label text'})
  NEW_OPTION_ADD_BUTTON = this.NEW_OPTION_GROUP.getByRole('button', {name: 'Add'})

  CONFIRM_DELETE_DIALOG = this.page.getByRole('alertdialog', {name: 'Delete option?'})
  CONFIRM_DELETE_DIALOG_CONFIRM_BUTTON = this.CONFIRM_DELETE_DIALOG.getByRole('button', {name: 'Delete'})

  DROPDOWN_MENU_BUTTON = this.page.getByTestId('single-select-item-menu-button')

  MOVE_OPTION_BUTTON = this.page.getByTestId('single-select-item-move-button')
  MOVE_DIALOG_INPUT = this.page.getByTestId('single-select-move-text-input')
  POSITION_INPUT = this.page.getByTestId('drag-and-drop-move-modal-position-input')
  MOVE_DIALOG_SAVE_BUTTON = this.page.getByTestId('drag-and-drop-move-modal-move-item-button')

  getOptionRemoveButton(index: number) {
    return this.OPTION.nth(index).getByRole('button', {name: 'Remove option'})
  }

  getAllOptionTexts() {
    return this.OPTION_LABEL.allInnerTexts()
  }

  async clickRemoveOption(index: number) {
    await this.page.getByTestId('single-select-item-menu-button').nth(index).click()
    await this.REMOVE_OPTION_BUTTON.click()
  }

  async clickEditOption(index: number) {
    await this.page.getByTestId('single-select-item-menu-button').nth(index).click()
    await this.EDIT_OPTION_BUTTON.nth(index).click()
  }

  async expectOptionToHaveText(index: number, value: string) {
    await expect(this.OPTION_LABEL.nth(index)).toHaveText(value)
  }

  async expectOptionsCount(count: number) {
    await expect(this.OPTION).toHaveCount(count)
  }

  async expectRemoveOptionNotFound(index: number) {
    await this.page.getByTestId('single-select-item-menu-button').nth(index).click()
    await expect(this.page.getByRole('menuitem', {name: 'Remove option'})).toBeHidden()
  }
}
