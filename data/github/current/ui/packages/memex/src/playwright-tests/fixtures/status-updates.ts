import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'

export class StatusUpdates extends BasePageViewWithMemexApp {
  CANCEL_UPDATE_BUTTON = this.page.getByTestId('status-update-cancel-button')
  CREATE_UPDATE_BUTTON = this.page.getByTestId('status-updates-create-button')
  STATUS_UPDATE_SAVE_BUTTON = this.page.getByTestId('status-update-save-button')
  CREATE_UPDATE_CONTAINER = this.page.getByTestId('status-updates-create-container')
  START_DATE_PICKER_BUTTON = this.page.getByTestId('status-updates-start-date-picker')
  STATUS_PICKER_BUTTON = this.page.getByTestId('status-updates-status-picker')
  STATUS_UPDATE_MARKDOWN_EDITOR = this.page.getByTestId('status-updates-markdown-editor')
  TARGET_DATE_PICKER_BUTTON = this.page.getByTestId('status-updates-target-date-picker')
  STATUS_UPDATE_ITEM_LIST = this.page.getByRole('list', {name: 'Status updates'})
  STATUS_UPDATE_MENU_EDIT_BUTTON = this.page.getByRole('menuitem', {name: 'Edit'})
  LATEST_STATUS_UPDATE = this.page.getByTestId('latest-status-update')
  LATEST_STATUS_UPDATE_TOKEN_BUTTON = this.page.getByTestId('latest-status-update-token-button')
  LATEST_STATUS_UPDATE_TOKEN_BUTTON_TEXT = this.page.getByTestId('latest-status-update-token-button-text')
  LATEST_STATUS_UPDATE_NULL_BUTTON = this.page.getByTestId('latest-status-update-null-button')
  NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE = this.page.getByTestId('notification-subscriptions-toggle')

  public async openStatusUpdateEditor() {
    await this.CREATE_UPDATE_BUTTON.click()
    await expect(this.CREATE_UPDATE_CONTAINER).toBeVisible()

    await expect(this.START_DATE_PICKER_BUTTON).toBeVisible()
    await expect(this.STATUS_PICKER_BUTTON).toBeVisible()
    await expect(this.STATUS_UPDATE_MARKDOWN_EDITOR).toBeVisible()
    await expect(this.TARGET_DATE_PICKER_BUTTON).toBeVisible()
  }

  public async selectStatus(status: string) {
    await this.STATUS_PICKER_BUTTON.click()
    if (status === 'clear') {
      await this.page.getByTestId('item-picker-root').locator('[aria-selected="true"]').click()
      await expect(this.STATUS_PICKER_BUTTON).toContainText('Status')
    } else {
      await this.page.getByTestId('item-picker-root').getByText(status, {exact: true}).click()
      await expect(this.STATUS_PICKER_BUTTON).toContainText(status)
    }
  }

  public async selectStartDate(date: string) {
    await this.START_DATE_PICKER_BUTTON.click()
    if (date === 'clear') {
      await this.page.getByTestId('datepicker-panel').getByText('Clear', {exact: true}).click()
      await expect(this.START_DATE_PICKER_BUTTON).toContainText('Start date')
    } else {
      await this.page.getByTestId('datepicker-panel').getByRole('gridcell').getByText(date, {exact: true}).click()
      await expect(this.START_DATE_PICKER_BUTTON).toContainText(date)
    }
  }

  public async selectTargetDate(date: string) {
    await this.TARGET_DATE_PICKER_BUTTON.click()
    if (date === 'clear') {
      await this.page.getByTestId('datepicker-panel').getByText('Clear', {exact: true}).click()
      await expect(this.TARGET_DATE_PICKER_BUTTON).toContainText('Target date')
    } else {
      await this.page.getByTestId('datepicker-panel').getByText(date, {exact: true}).click()
      await expect(this.TARGET_DATE_PICKER_BUTTON).toContainText(date)
    }
  }

  public async setStatusBody(body: string) {
    await this.STATUS_UPDATE_MARKDOWN_EDITOR.locator('textarea').type(body)
  }

  public async saveStatusUpdate() {
    await this.STATUS_UPDATE_SAVE_BUTTON.click()

    await expect(this.CREATE_UPDATE_CONTAINER).toBeHidden()
  }

  public async openStatusUpdateItemMenu(index: number) {
    const statusUpdateItem = this.getStatusUpdateByIndex(index)
    await statusUpdateItem.getByRole('button', {name: 'Status update options'}).click()
  }

  public async getStatusUpdateItemMenuOption(index: number, option: 'edit' | 'delete' | 'copy link') {
    await this.openStatusUpdateItemMenu(index)
    return this.page
      .getByRole('menu', {name: 'Status update options'})
      .getByRole('menuitem', {name: new RegExp(option, 'i')})
  }

  public getStatusUpdateItems() {
    return this.STATUS_UPDATE_ITEM_LIST.getByRole('listitem')
  }

  public getStatusUpdateByIndex(index: number) {
    return this.getStatusUpdateItems().nth(index)
  }

  public getStatusUpdateItemById(id: string | number) {
    return this.page.getByTestId(`status-update-item-${id}`)
  }

  public async expectStatusUpdateToHaveValue(
    index: number,
    field: 'status' | 'start-date' | 'target-date' | 'body',
    value: string | RegExp,
  ) {
    await expect(this.getStatusUpdateByIndex(index).getByTestId(`status-update-item-value-${field}`)).toContainText(
      value,
    )
  }

  public async expectStatusUpdateToHaveValues(
    index: number,
    status: string | RegExp,
    startDate: string | RegExp,
    targetDate: string | RegExp,
    body: string | RegExp,
  ) {
    await this.expectStatusUpdateToHaveValue(index, 'status', status)
    await this.expectStatusUpdateToHaveValue(index, 'start-date', startDate)
    await this.expectStatusUpdateToHaveValue(index, 'target-date', targetDate)
    await this.expectStatusUpdateToHaveValue(index, 'body', body)
  }

  public async expectAddStatusUpdateEditorToHaveValues(
    status: string | RegExp,
    startDate: string | RegExp,
    targetDate: string | RegExp,
    body: string | RegExp,
  ) {
    await expect(this.STATUS_PICKER_BUTTON).toContainText(status)
    await expect(this.START_DATE_PICKER_BUTTON).toContainText(startDate)
    await expect(this.TARGET_DATE_PICKER_BUTTON).toContainText(targetDate)
    await expect(this.STATUS_UPDATE_MARKDOWN_EDITOR.locator('textarea')).toHaveValue(body)
  }
}
