import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'

export class SidePanel extends BasePageViewWithMemexApp {
  SIDE_PANEL = this.page.getByRole('dialog')
  PROJECT_SIDE_PANEL = this.page.getByRole('dialog', {name: 'Side panel: Project information'})
  BULK_ADD_SIDE_PANEL = this.page.getByRole('dialog', {name: 'Side panel: Add items to project'})

  TITLE_LOCATOR = this.SIDE_PANEL.getByTestId('side-panel-title-content')
  MARKDOWN_EDITOR_LOCATOR = this.SIDE_PANEL.getByTestId('markdown-editor')
  MARKDOWN_EDITOR_INPUT_LOCATOR = this.MARKDOWN_EDITOR_LOCATOR.locator('textarea')

  private TITLE_CONTAINER_INPUT = this.SIDE_PANEL.getByTestId('side-panel-title-input')
  private TITLE_EDIT_BUTTON = this.SIDE_PANEL.getByTestId('side-panel-title-edit-button')
  private TITLE_SAVE_BUTTON = this.SIDE_PANEL.getByTestId('side-panel-title-save-button')
  private TITLE_REVERT_BUTTON = this.SIDE_PANEL.getByTestId('side-panel-title-revert-button')

  private BULK_ADD = this.page.getByTestId('bulk-add-view')
  private SUGGESTED_ITEM_LIST = this.page.getByTestId('side-panel-suggested-items')
  SUGGESTED_ITEM = this.SUGGESTED_ITEM_LIST.locator('li')
  NO_SUGGESTED_ITEMS = this.page.getByTestId('side-panel-no-suggested-items')
  NO_SUGGESTED_REPOS = this.page.getByTestId('side-panel-no-suggested-repos')
  BULK_ADD_BUTTON = this.page.getByTestId('bulk-add-button')
  ITEMS_RECENT_COUNT = this.SUGGESTED_ITEM_LIST.getByTestId('side-panel-suggested-items-recent-count')
  ITEMS_FOOTER = this.SUGGESTED_ITEM_LIST.getByTestId('side-panel-suggested-items-footer')
  ALL_ITEMS_SELECTOR = this.page.getByTestId('selection-all-items')
  ALL_ITEMS_SELECTOR_INPUT = this.ALL_ITEMS_SELECTOR.locator('input[type="checkbox"]')

  PIN_BUTTON = this.page.getByRole('button', {name: 'Pin side panel'})
  UNPIN_BUTTON = this.page.getByRole('button', {name: 'Unpin side panel'})
  CLOSE_BUTTON = this.page.getByRole('button', {name: 'Close panel'})

  NEW_ISSUE_VIEWER_DEVELOPMENT_WARNING = this.page.getByTestId('new-issue-viewer-development-warning')

  async expectTitleContentLoaded() {
    await expect(this.TITLE_LOCATOR).not.toHaveText('Loading...')
  }

  async expectSidePanelNotToBeVisible() {
    return expect(this.SIDE_PANEL).toBeHidden()
  }
  async expectTitleEditButtonToBeVisible() {
    return expect(this.TITLE_EDIT_BUTTON).toBeVisible()
  }

  public getTitle() {
    return this.TITLE_LOCATOR
  }

  public getTitleInput() {
    return this.TITLE_CONTAINER_INPUT
  }

  public getTitleEditButton() {
    return this.TITLE_EDIT_BUTTON
  }

  public getTitleSaveButton() {
    return this.TITLE_SAVE_BUTTON
  }

  public getTitleRevertButton() {
    return this.TITLE_REVERT_BUTTON
  }

  public getMarkdownEditorInput() {
    return this.MARKDOWN_EDITOR_INPUT_LOCATOR
  }

  public async openBulkAddSidePanel() {
    // Open the discovery suggestions
    await this.memex.omnibar.NEW_ITEM.click()
    // Click 'Add item from sidebar'
    await this.memex.omnibar.discoverySuggestions.ADD_ITEM_SIDEPANEL.click()
    await expect(this.BULK_ADD_SIDE_PANEL).toBeVisible()
  }

  async expectBulkAddSidePanelToBeVisible() {
    return expect(this.BULK_ADD).toBeVisible()
  }

  async expectBulkAddSidePanelNotToBeVisible() {
    return expect(this.BULK_ADD).toBeHidden()
  }

  async expectMarkdownEditorToHaveValue(value: string) {
    return expect(this.MARKDOWN_EDITOR_INPUT_LOCATOR).toHaveValue(value)
  }

  public getIssueSidePanel(issueName: string, pinned = false) {
    return this.page.getByRole(pinned ? 'complementary' : 'dialog', {name: `Side panel: Issue: ${issueName}`})
  }

  public getDraftSidePanel(issueName: string, pinned = false) {
    return this.page.getByRole(pinned ? 'complementary' : 'dialog', {name: `Side panel: Draft issue: ${issueName}`})
  }
}
