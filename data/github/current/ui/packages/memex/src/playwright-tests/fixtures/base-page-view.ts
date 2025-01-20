import type {Page} from '@playwright/test'

import type {MemexApp} from './memex-app'
import type {test} from './test-extended'

export abstract class BasePageView {
  protected page: Page
  protected test: typeof test

  constructor(page: Page) {
    this.page = page
  }
}

export abstract class BasePageViewWithMemexApp extends BasePageView {
  protected memex: MemexApp
  constructor(page: Page, memex: MemexApp) {
    super(page)
    this.memex = memex
  }
}
