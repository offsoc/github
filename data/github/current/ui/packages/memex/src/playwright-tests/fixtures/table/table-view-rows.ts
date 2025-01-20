import {expect, type Locator, type Page} from '@playwright/test'

import {rowTestId} from '../../helpers/table/selectors'
import {BasePageView} from '../base-page-view'

export class TableViewRows extends BasePageView {
  protected root: Locator

  constructor(page: Page, root: Locator) {
    super(page)
    this.root = root
  }

  public getRow(rowIndex: number) {
    return new TableRow(this.getRowLocator(rowIndex))
  }

  public getRowLocator(rowIndex: number) {
    return this.root.getByTestId(rowTestId(rowIndex))
  }
}

export class TableRow {
  private locator: Locator

  CONTEXT_MENU: {
    LIST: Locator
    TRIGGER: Locator
    ACTION_ARCHIVE: Locator
    ACTION_DELETE: Locator
  }

  constructor(rowLocator: Locator) {
    this.locator = rowLocator
    const LIST = this.locator.page().getByTestId('row-menu')
    this.CONTEXT_MENU = {
      LIST,
      TRIGGER: this.locator.getByRole('button', {name: 'Row actions'}),
      ACTION_ARCHIVE: LIST.getByTestId('row-menu-archive'),
      ACTION_DELETE: LIST.getByTestId('row-menu-delete'),
    }
  }

  public async expectDataHovercardSubjectTag(expectedValue: string | null) {
    if (expectedValue == null) {
      const attributeValue = await this.locator.getAttribute('data-hovercard-subject-tag')
      expect(attributeValue).toBeNull()
    } else {
      return expect(this.locator).toHaveAttribute('data-hovercard-subject-tag', expectedValue)
    }
  }
}
