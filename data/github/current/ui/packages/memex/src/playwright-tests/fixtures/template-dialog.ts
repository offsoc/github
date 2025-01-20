import {expect, type Page} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'
import type {MemexApp} from './memex-app'

export class TemplateDialog extends BasePageViewWithMemexApp {
  constructor(page: Page, memex: MemexApp) {
    super(page, memex)
  }

  // Separate naming for the new template dialog UI, which can be removed once the
  // `memex_new_template_experience` is fully shipped and has replaced the old dialog
  NEW_DIALOG = this.page.getByRole('dialog', {name: 'Create project'})
  NEW_CLOSE_BUTTON = this.page.getByRole('button', {name: 'Close'})
  NEW_TEMPLATE_LINK = (linkName: string) => this.page.getByRole('link', {name: linkName})
  NEW_APPLY_TEMPLATE_BUTTON = this.page.getByRole('button', {name: 'Create project'})
  NEW_SEARCH_INPUT = this.NEW_DIALOG.getByRole('textbox', {name: 'Search templates'})
  NEW_SEARCH_INPUT_CLEAR_BUTTON = this.NEW_DIALOG.getByRole('button', {name: 'Clear search'})

  TEMPLATE_DIALOG_CREATE_BUTTON = this.page.getByTestId('template-dialog-button')
  TEMPLATE_DIALOG_TABLE_OPTION = this.page.getByTestId('template-dialog-action-item-table')
  TEMPLATE_DIALOG_BOARD_OPTION = this.page.getByTestId('template-dialog-action-item-board')
  TEMPLATE_DIALOG_ROADMAP_OPTION = this.page.getByTestId('template-dialog-action-item-roadmap')
  TEMPLATE_DIALOG_BACKLOG_OPTION = this.page.getByTestId('template-dialog-action-item-backlog')
  TEMPLATE_DIALOG_FEATURE_OPTION = this.page.getByTestId('template-dialog-action-item-feature')
  NAME_INPUT = this.page.getByRole('textbox', {name: 'Project name'})

  async close() {
    await this.page.getByRole('button', {name: 'Close'}).click()
  }

  async expectCreateButtonToHaveLoadingText() {
    return expect(this.TEMPLATE_DIALOG_CREATE_BUTTON).toHaveText(`Loading template...`)
  }

  async expectCreateButtonToBeDisabled() {
    return expect(this.TEMPLATE_DIALOG_CREATE_BUTTON).toBeDisabled()
  }

  async setProjectName(name: string) {
    await this.NAME_INPUT.fill(name)
  }
}
