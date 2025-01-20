import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'

export class Template extends BasePageViewWithMemexApp {
  TEMPLATE_DIALOG_IMAGE = this.page.getByTestId('template-dialog-image')

  public async expectCorrectColorModeImageShown(imgUrl: string) {
    return expect(this.TEMPLATE_DIALOG_IMAGE).toHaveAttribute('src', imgUrl)
  }
}
