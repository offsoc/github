import {expect, type Locator, type Page} from '@playwright/test'

import {BasePageView} from '../base-page-view'

export class TableViewColumns extends BasePageView {
  protected root: Locator
  public readonly COLUMN_HEADERS = this.page.getByRole('grid').getByRole('columnheader')
  public readonly SORTED_ASCENDING_CELLS = this.COLUMN_HEADERS.and(this.page.locator('[aria-sort="ascending"]'))
  public readonly SORTED_DESCENDING_CELLS = this.COLUMN_HEADERS.and(this.page.locator('[aria-sort="descending"]'))

  constructor(page: Page, root: Locator) {
    super(page)
    this.root = root
  }

  public getVisibleFieldCount() {
    return this.COLUMN_HEADERS.count()
  }

  public expectVisibleFieldCount(count: number) {
    return expect(this.COLUMN_HEADERS).toHaveCount(count)
  }
}
