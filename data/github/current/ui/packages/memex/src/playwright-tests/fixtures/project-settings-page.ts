import type {Locator} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'
import {SingleSelectForm} from './single-select-form'

export class ProjectSettingsPage extends BasePageViewWithMemexApp {
  singleSelectForm = new SingleSelectForm(this.page, this.memex)

  /**
   * The input field for the project's name/title.
   */
  PROJECT_NAME_INPUT = this.page.getByRole('textbox', {name: 'Project name'})
  /**
   * The unified save button for project settings.
   */
  SAVE_PROJECT_SETTINGS_BUTTON = this.page.getByTestId('save-project-settings-button')
  DESCRIPTION_EDITOR = this.page.getByTestId('description-editor')
  /**
   * Button to re-open the project when closed.
   */
  REOPEN_PROJECT_BUTTON = this.page.locator('role=button[name="Re-open this project"]')

  SAVE_CHANGES_BUTTON = this.page.locator('role=button[name="Save"]')

  DELETE_ITERATION_BUTTON = this.page.getByTestId('delete-iteration')
  COLUMN_SETTINGS_SAVED_MESSAGE = this.page.getByTestId('column-settings-saved-message')

  COLUMN_SETTINGS_BANNER = this.page.getByTestId('column-settings-banner')

  ITERATION_NAME_INPUT = this.page.getByTestId('iteration-title')
  COMPLETED_ITERATIONS = this.page.getByTestId('completed-iterations')

  CONFIRM_DELETE_ITERATION_DIALOG = this.page.getByRole('alertdialog', {name: 'Delete iteration?'})
  CONFIRM_DELETE_BUTTON = this.CONFIRM_DELETE_ITERATION_DIALOG.getByRole('button', {name: 'Delete'})

  FIELD_NAME_INPUT = this.page.getByRole('textbox', {name: 'Field name'})

  getCustomFieldLink(fieldName: string): Locator {
    return this.page.getByTestId(`ColumnSettingsItem{id: ${fieldName}}`)
  }

  getCustomFieldLeadingVisual(fieldName: string): Locator {
    return this.page.getByTestId(`ColumnSettingsItemIcon{id: ${fieldName}}`)
  }

  getCustomFieldNames(): Promise<Array<string>> {
    return this.page.getByTestId(`project-column-settings-list`).locator('a').allInnerTexts()
  }

  /**
   * Get the locator for a field link in the project settings field list.
   */
  getFieldLink(fieldName: string): Locator {
    return this.page.getByRole('listitem').getByRole('link', {name: fieldName})
  }

  /**
   * Navigates to the integration test settings page directly.
   */
  async visit() {
    await this.memex.navigateToStory('integrationTestSettingsPage', {
      testIdToAwait: 'settings-page',
    })
  }

  async navigateToSettingsForCustomField(fieldName: string) {
    await this.memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await this.memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await this.getCustomFieldLink(fieldName).click()
  }
}
