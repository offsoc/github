import {expect, type Page} from '@playwright/test'

import type {MemexWorkflowContentType, MemexWorkflowId} from '../../client/api/workflows/contracts'
import {FilterQueryResources} from '../../client/strings'
import {mustFind} from '../helpers/dom/assertions'
import {submitConfirmDialog} from '../helpers/dom/interactions'
import {_} from '../helpers/dom/selectors'
import {eventually} from '../helpers/utils'
import {BasePageViewWithMemexApp} from './base-page-view'
import type {MemexApp} from './memex-app'

export class AutomationPage extends BasePageViewWithMemexApp {
  constructor(page: Page, memex: MemexApp) {
    super(page, memex)
  }

  AUTOMATION_PAGE_LOCATOR = this.page.getByTestId('automation-page')
  ENABLE_WORKFLOW_TOGGLE_LOCATOR = this.page.getByTestId('workflow-enable-toggle-container').getByRole('button')
  WORKFLOW_SET_FIELD_ANCHOR_LOCATOR = this.page.getByTestId('workflow-set-field-anchor')
  WORKFLOW_SET_FIELD_PANEL_LOCATOR = this.page.getByTestId('workflow-set-field-panel')
  AUTO_ARCHIVE_ITEMS_TAB = this.page.getByTestId('workflow-nav-item-query_matched_archive_project_item')
  AUTO_ADD_ITEMS_TAB = this.page.getByTestId('workflow-nav-item-query_matched_add_project_item')
  AUTOMATION_ARCHIVE_BLOCK = this.page.getByTestId('automation-archive-block')
  AUTOMATION_ADD_ITEM_BLOCK = this.page.getByTestId('automation-add-item-block')
  GET_ITEMS_BLOCK = this.page.getByTestId('get-items-block')
  WHEN_CONTENT_TYPES_SELECTOR = this.page.getByTestId('workflows-when-content-types-anchor')
  // Classic content type option locators
  WHEN_CONTENT_TYPES_OPTION_ISSUE = this.page.getByTestId('workflows-when-content-types-option-Issue')
  WHEN_CONTENT_TYPES_OPTION_PULL_REQUEST = this.page.getByTestId('workflows-when-content-types-option-PullRequest')
  // Next content type option locators
  WHEN_CONTENT_TYPES_PICKER_OPTION_ISSUE = this.page
    .getByTestId('workflows-when-content-types-panel')
    .locator('div[data-id="Issue"]')
  WHEN_CONTENT_TYPES_PICKER_OPTION_PULL_REQUEST = this.page
    .getByTestId('workflows-when-content-types-panel')
    .locator('div[data-id="PullRequest"]')
  FILTER_INPUT = this.page.getByTestId('automation-block').getByTestId('base-filter-input').getByRole('combobox')
  AUTO_ADD_FILTER_INPUT = this.page
    .getByTestId('get-items-block')
    .getByTestId('base-filter-input')
    .getByRole('combobox')
  REPO_PICKER_BUTTON = this.page.getByTestId('repo-suggestions-button')
  REPO_PICKER_REPO_LIST = this.page.getByTestId('repo-picker-repo-list')
  READ_ONLY_LABEL = this.page.getByTestId('read-only-label')
  CLEAR_FILTER_QUERY = this.page.getByTestId('clear-filter-query')
  FILTER_INPUT_SAVE_BUTTON = this.page.getByTestId('filter-actions-save-changes-button')
  FILTER_SUGGESTIONS = this.page.getByTestId('search-suggestions-box')
  EMPTY_QUERY_ERROR = this.page.getByText('Filter cannot be empty')
  EMPTY_QUERY_WARNING = this.page.getByText(
    'An empty filter will match all newly created and updated Issues and Pull Requests',
  )
  FILTER_INPUT_COUNT = this.page.getByTestId('filter-results-count')
  DISABLED_FILTER_INPUT = this.page.getByRole('textbox', {name: 'Filters', disabled: true})
  DISABLED_FILTER_INPUT_COUNT = this.page.getByTestId('disabled-filter-results-count')
  DIALOG = this.page.getByRole('alertdialog')
  DIALOG_ACTIONS = this.DIALOG.getByRole('button')
  DIALOG_SAVE_AND_ENABLE = this.DIALOG.getByText('Save and enable')
  DIALOG_CANCEL = this.DIALOG.getByText('Cancel')
  DISCARD = this.page.getByTestId('workflow-discard-button')
  DELETE = this.page.getByTestId('workflow-delete-button')
  SAVE = this.page.getByTestId('workflow-save-button')
  EDIT = this.page.getByTestId('workflow-edit-button')
  ERROR_UNDERLINE = this.page.locator('span[aria-errormessage]')
  // Workflow name editor locators
  WORKFLOW_NAME_HEADING = this.page.getByTestId('workflow-name-heading')
  WORKFLOW_NAME_EDIT_BUTTON = this.page.getByRole('button', {name: 'Edit workflow name'})
  WORKFLOW_NAME_EDITOR_INPUT = this.page.getByTestId('workflow-name-editor-input')
  WORKFLOW_NAME_EDITOR_SAVE_BUTTON = this.page.getByRole('button', {name: 'Save'})
  WORKFLOW_NAME_EDITOR_CANCEL_BUTTON = this.page.getByRole('button', {name: 'Cancel'})
  WORKFLOW_NAME_EDITOR_ERROR = this.page.locator('#workflow-name-editor-error')
  WORKFLOW_NAME_EDITOR = this.page.getByRole('dialog', {name: 'Edit workflow name'})
  NAVIGATION = this.page.getByTestId('settings-side-nav')

  // Create workflow locators
  NEW_WORKFLOW_DIALOG_INPUT = this.page.getByTestId('new-workflow-dialog-input')
  NEW_WORKFLOW_DIALOG_ERROR = this.page.getByTestId('new-workflow-dialog-error')
  NEW_WORKFLOW_DIALOG_CREATE_BUTTON = this.page.getByTestId('new-workflow-dialog-create-button')

  // Workflow content type locators
  WORKFLOW_CONTENT_TYPE_BUTTON = this.page.getByTestId('workflows-when-content-types-anchor')
  WORKFLOW_CONTENT_TYPE_PANEL = this.page.getByTestId('workflows-when-content-types-panel')

  async toggleWorkflow() {
    return this.ENABLE_WORKFLOW_TOGGLE_LOCATOR.click()
  }

  async navigateToWorkflow(workflowId: MemexWorkflowId) {
    return this.getWorkflowNavigationLinkLocator(workflowId).click()
  }

  expectWorkflowMenuToBeNull(workflowId: MemexWorkflowId) {
    return expect(this.getWorkflowNavigationLinkMenuLocator(workflowId)).toBeNull()
  }

  async expectWorkflowMenuToBeHidden(workflowId: MemexWorkflowId) {
    return expect(this.getWorkflowNavigationLinkMenuLocator(workflowId)).toBeHidden()
  }

  async toggleWorkflowMenu(workflowId: MemexWorkflowId) {
    return this.getWorkflowNavigationLinkMenuLocator(workflowId).click()
  }

  async expectWorkflowMenuToBeOpen(workflowId: MemexWorkflowId) {
    return expect(this.getWorkflowNavigationLinkMenuListLocator(workflowId)).toBeVisible()
  }

  async expectWorkflowMenuToBeClosed(workflowId: MemexWorkflowId) {
    return expect(this.getWorkflowNavigationLinkMenuListLocator(workflowId)).toBeHidden()
  }

  async expectWorkflowMenuToContainDelete(workflowId: MemexWorkflowId) {
    return expect(this.getWorkflowNavigationLinkMenuDeleteLocator(workflowId)).toBeVisible()
  }

  async expectWorkflowMenuToNotContainDelete(workflowId: MemexWorkflowId) {
    return expect(this.getWorkflowNavigationLinkMenuDeleteLocator(workflowId)).toBeHidden()
  }

  async clickDeleteWorkflowMenuOption(workflowId: MemexWorkflowId) {
    return this.getWorkflowNavigationLinkMenuDeleteLocator(workflowId).click()
  }

  private getWorkflowNavigationLinkMenuDeleteLocator(workflowId: MemexWorkflowId) {
    return this.page.getByTestId(`workflow-nav-item-menu-delete-${workflowId}`)
  }

  async expectAutomationPageVisible() {
    return expect(this.AUTOMATION_PAGE_LOCATOR).toBeVisible()
  }

  async expectAutomationPageNotVisible() {
    return expect(this.AUTOMATION_PAGE_LOCATOR).toBeHidden()
  }

  async expectWorkflowTurnedOff() {
    return expect(this.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toHaveAttribute('aria-pressed', 'false')
  }

  async expectWorkflowTurnedOn() {
    return expect(this.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toHaveAttribute('aria-pressed', 'true')
  }

  // Shared locators between classic and next
  async openSetFieldMenu() {
    return this.WORKFLOW_SET_FIELD_ANCHOR_LOCATOR.click()
  }

  async expectWorkflowSetFieldMenuToBeClosed() {
    return expect(this.WORKFLOW_SET_FIELD_PANEL_LOCATOR).toBeHidden()
  }

  async expectWorkflowSetFieldToHaveText(text: string) {
    return expect(this.WORKFLOW_SET_FIELD_ANCHOR_LOCATOR).toHaveText(text)
  }

  // Classic set field option locators
  async expectWorkflowSetFieldMenuOptionCount(count: number) {
    return expect(this.getSetFieldMenuOptionsLocator()).toHaveCount(count)
  }

  async expectWorkflowSetFieldMenuSelectedOptionCount(count: number) {
    return expect(this.getSetFieldMenuSelectedOptionLocator()).toHaveCount(count)
  }

  async setSetFieldMenuOption(optionName: string) {
    return this.getSetFieldMenuOptionLocator(optionName).click()
  }

  async clickWorkflowSetFieldMenuSelectedOption() {
    return this.getSetFieldMenuSelectedOptionLocator().click()
  }

  async expectWorkflowSetFieldMenuSelectedOptionToHaveText(text: string) {
    return expect(this.getSetFieldMenuSelectedOptionLocator()).toHaveText(text)
  }

  // Next set field option locators
  async expectWorkflowSetFieldPickerMenuOptionCount(count: number) {
    return expect(this.getSetFieldMenuPickerOptionsLocator()).toHaveCount(count)
  }

  async expectWorkflowSetFieldMenuPickerSelectedOptionCount(count: number) {
    return expect(this.getSetFieldMenuPickerSelectedOptionLocator()).toHaveCount(count)
  }

  async expectWorkflowSetFieldMenuPickerSelectedOptionToHaveText(text: string) {
    return expect(this.getSetFieldMenuPickerSelectedOptionLocator()).toHaveText(text)
  }

  async setSetFieldMenuPickerOption(optionName: string) {
    return this.getSetFieldMenuPickerOptionLocator(optionName).click()
  }

  async clickWorkflowSetFieldMenuPickerSelectedOption() {
    return this.getSetFieldMenuPickerSelectedOptionLocator().click()
  }

  async navigateToAutoArchiveItemsTab() {
    await this.AUTO_ARCHIVE_ITEMS_TAB.click()
    return expect(this.AUTOMATION_ARCHIVE_BLOCK).toBeVisible()
  }

  async navigateToAutoAddItemsTab() {
    await this.AUTO_ADD_ITEMS_TAB.click()
    return expect(this.AUTOMATION_ADD_ITEM_BLOCK).toBeVisible()
  }

  async expectAutoArchiveConfirmationDialogToShow(text: string | null = null) {
    await expect(this.DIALOG).toBeVisible()

    await expect(this.DIALOG_ACTIONS).toHaveText(['', 'Cancel', /Update workflow|Save and enable/i])
    if (text) {
      await expect(this.DIALOG).toContainText(text)
    }
  }

  async expectAutoArchiveConfirmationDialogToNotShow() {
    return expect(this.DIALOG).toBeHidden()
  }

  async expectAutoAddInputToHaveValue(value: string) {
    await expect(this.AUTO_ADD_FILTER_INPUT).toHaveValue(value)
  }

  /**
   * Items suggested by the filter. This locator matches any item with a test
   * id that starts with this string, so we can't use `getByTestId` here.
   *
   * NOTE: There will most likely be multiple elements for this locator
   */
  SUGGESTIONS_ITEMS = this.page.locator('[data-testid^="search-suggestions-item"]')

  /**
   * The number of suggestions displayed in the menu, presented to screen readers only
   */
  SUGGESTIONS_RESULT_COUNT = this.page.getByTestId('search-suggestions-box-feedback')

  /** Menu item button to duplicate a specific workflow */
  DUPLICATE_WORKFLOW_MENU_ITEM = this.page.getByRole('menuitem', {name: 'Duplicate workflow'})

  async expectToHaveSuggestions(suggestions: Array<string>) {
    return expect(this.SUGGESTIONS_ITEMS).toHaveText(suggestions)
  }
  async expectSuggestionsResultCount(num: number) {
    const count = await this.SUGGESTIONS_RESULT_COUNT.innerText()
    return expect(count).toEqual(`${num} result${num === 1 ? '' : 's'}.`)
  }

  async updateAndSaveFilterQuery(query: string) {
    await expect(this.FILTER_INPUT).toBeVisible()
    await this.FILTER_INPUT.fill(query)

    await this.FILTER_INPUT_SAVE_BUTTON.click()
  }

  async updateAndSaveQuery(query: string) {
    await expect(this.FILTER_INPUT).toBeVisible()
    await this.FILTER_INPUT.fill(query)

    await this.SAVE.click()
  }

  async expectQueryToBeDisabled() {
    await expect(this.DISABLED_FILTER_INPUT).toBeVisible()
  }

  async expectMatchingItems(disabled = false) {
    const locator = disabled ? this.DISABLED_FILTER_INPUT_COUNT : this.FILTER_INPUT_COUNT
    await eventually(async () => {
      const count = parseInt(await locator.textContent(), 10)
      expect(count).toBeGreaterThan(0)
    })
  }

  async expectNoMatchingItems(disabled = false) {
    const locator = disabled ? this.DISABLED_FILTER_INPUT_COUNT : this.FILTER_INPUT_COUNT
    return expect(await locator.textContent()).toBe('0')
  }

  async expectWorkflowNameError(expectedError: string) {
    await expect(this.WORKFLOW_NAME_EDITOR_ERROR).toBeVisible()
    return await expect(this.WORKFLOW_NAME_EDITOR_ERROR).toHaveText(expectedError)
  }

  async expectPreventWorkflowNameSave() {
    await expect(this.WORKFLOW_NAME_EDITOR_SAVE_BUTTON).toBeEnabled()
    await this.WORKFLOW_NAME_EDITOR_SAVE_BUTTON.click()
    await expect(this.WORKFLOW_NAME_EDITOR).toBeVisible()
    await expect(this.WORKFLOW_NAME_EDITOR_ERROR).toBeVisible()
  }

  async expectSaveToBeDisabled(disabled = true) {
    return disabled ? await expect(this.SAVE).toBeDisabled() : await expect(this.SAVE).toBeEnabled()
  }

  async enableWorkflow() {
    await this.expectWorkflowTurnedOff()
    await this.toggleWorkflow()
    try {
      await submitConfirmDialog(this.page, 'Save and enable')
    } catch (e) {
      // ignoring error if dialog is not visible
    }
  }

  async openContentTypeSelectPanel() {
    await this.WHEN_CONTENT_TYPES_SELECTOR.click()
    await this.page.waitForSelector(_('workflows-when-content-types-panel'))
  }

  async clickContentType(contentType: MemexWorkflowContentType) {
    await mustFind(this.page, _('workflows-when-content-types-panel'))

    if (contentType === 'Issue') {
      await this.WHEN_CONTENT_TYPES_OPTION_ISSUE.click()
    } else {
      await this.WHEN_CONTENT_TYPES_OPTION_PULL_REQUEST.click()
    }
  }

  async createActiveWorkflow() {
    await this.EDIT.click()
    await this.SAVE.click()
  }

  async openWorkflowMenu(workflowId: number) {
    await this.getWorkflowNavigationLinkMenuLocator(workflowId).click()
  }

  async openNewWorkflowDialog(workflowId: number) {
    await this.openWorkflowMenu(workflowId)
    await this.DUPLICATE_WORKFLOW_MENU_ITEM.click()
  }

  async addNewWorkflow(workflowId: number, workflowName: string) {
    await this.openNewWorkflowDialog(workflowId)
    await this.NEW_WORKFLOW_DIALOG_INPUT.fill(workflowName)
    await this.NEW_WORKFLOW_DIALOG_CREATE_BUTTON.click()
  }

  getSuggestedItem(testId: string) {
    return this.page.getByTestId(testId)
  }

  getFieldErrorTooltip(field: string) {
    return this.page.getByRole('tooltip', {name: `Invalid filter: Unknown field name "${field}"`})
  }

  getValueErrorTooltip(value: string, field: string) {
    return this.page.getByRole('tooltip', {
      name: `Invalid value: "${value}" doesn't match options for the "${field}" field`,
    })
  }

  getUpdatedValueErrorTooltip() {
    return this.page.getByRole('tooltip', {name: FilterQueryResources.updatedValueErrorMessage})
  }

  private getWorkflowNavigationLinkLocator(workflowId: MemexWorkflowId) {
    return this.page.getByTestId(`workflow-nav-item-${workflowId}`)
  }

  private getWorkflowNavigationLinkMenuLocator(workflowId: MemexWorkflowId) {
    return this.page.getByTestId(`workflow-nav-item-menu-${workflowId}`)
  }

  private getWorkflowNavigationLinkMenuListLocator(workflowId: MemexWorkflowId) {
    return this.page.getByTestId(`workflow-nav-item-menu-list-${workflowId}`)
  }

  // Classic set field menu locators
  private getSetFieldMenuOptionLocator(optionName: string) {
    return this.page.locator(`${_('workflow-set-field-option')}[name="${optionName}"]`)
  }

  private getSetFieldMenuOptionsLocator() {
    return this.page.getByTestId('workflow-set-field-option')
  }

  private getSetFieldMenuSelectedOptionLocator() {
    return this.page.locator(`${_('workflow-set-field-option')}[aria-selected="true"]`)
  }

  // Next set field menu locators
  private getSetFieldMenuPickerOptionsLocator() {
    return this.WORKFLOW_SET_FIELD_PANEL_LOCATOR.getByRole('option')
  }

  private getSetFieldMenuPickerSelectedOptionLocator() {
    return this.WORKFLOW_SET_FIELD_PANEL_LOCATOR.locator('[role="option"][aria-selected="true"]')
  }

  private getSetFieldMenuPickerOptionLocator(name: string) {
    return this.page.locator(`[role="option"][data-id="${name}"]`)
  }
}
