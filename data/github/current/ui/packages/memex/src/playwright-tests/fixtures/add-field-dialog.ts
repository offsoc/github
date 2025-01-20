import {expect, type Page} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'
import type {MemexApp} from './memex-app'
import {SingleSelectForm} from './single-select-form'

export class AddFieldDialog extends BasePageViewWithMemexApp {
  constructor(page: Page, memex: MemexApp) {
    super(page, memex)
  }

  COLUMN_VISIBILITY_MENU_BUTTON = this.page.getByTestId('column-visibility-menu-trigger')
  COLUMN_VISIBILITY_MENU = this.page.getByTestId('column-visibility-menu')
  NEW_FIELD_MENU = this.page.getByTestId('add-column-menu')

  singleSelectForm = new SingleSelectForm(this.page, this.memex)

  NEW_FIELD_BUTTON = this.COLUMN_VISIBILITY_MENU.getByTestId('new-field-button')

  FIELD_NAME_INPUT = this.NEW_FIELD_MENU.getByTestId('add-column-name-input')
  FIELD_TYPE_MENU = this.NEW_FIELD_MENU.getByTestId('add-column-type')

  NEW_FIELD_SAVE_BUTTON = this.NEW_FIELD_MENU.getByRole('button', {name: 'Save'})
  NEW_FIELD_CANCEL_BUTTON = this.NEW_FIELD_MENU.getByRole('button', {name: 'Cancel'})

  public async show() {
    await this.COLUMN_VISIBILITY_MENU_BUTTON.click()
    await this.COLUMN_VISIBILITY_MENU.waitFor({state: 'visible'})
  }

  public async clickNewField() {
    await this.NEW_FIELD_BUTTON.click()
    await this.NEW_FIELD_MENU.isVisible()
  }

  public async setFieldName(text: string) {
    await expect(this.FIELD_NAME_INPUT).toBeFocused()

    await this.FIELD_NAME_INPUT.fill(text)
  }

  public expectFieldName(text: string) {
    return expect(this.FIELD_NAME_INPUT).toHaveValue(text)
  }

  public async setFieldType(type: 'text' | 'number' | 'date' | 'iteration' | 'single-select') {
    await this.FIELD_TYPE_MENU.click()
    // the field options are displayed in an overlay, for which we don't yet
    // have a good DOM parent to look for
    await this.page.getByTestId(`column-type-${type}`).click()
  }

  public expectFieldType(text: string) {
    return expect(this.FIELD_TYPE_MENU).toHaveText(text)
  }

  public clickSaveButton() {
    return this.NEW_FIELD_SAVE_BUTTON.click()
  }

  public expectSaveButtonToBeEnabled() {
    return expect(this.NEW_FIELD_SAVE_BUTTON).toBeEnabled()
  }

  public expectSaveButtonToBeDisabled() {
    return expect(this.NEW_FIELD_SAVE_BUTTON).toBeDisabled()
  }

  public clickCancelButton() {
    return this.NEW_FIELD_CANCEL_BUTTON.click()
  }
}
