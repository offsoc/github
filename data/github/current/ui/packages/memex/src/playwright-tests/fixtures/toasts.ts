import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'

export class Toasts extends BasePageViewWithMemexApp {
  TOAST_LOCATOR = this.page.getByTestId('toast')
  TOAST_ACTION = this.page.getByTestId('toast-action')

  async expectErrorMessageVisible(message: string) {
    await Promise.all([
      await expect(this.TOAST_LOCATOR).toBeVisible(),
      await expect(this.TOAST_LOCATOR).toContainText(message),
    ])
  }

  async expectErrorMessageHidden() {
    await expect(this.TOAST_LOCATOR).toBeHidden()
  }
}
