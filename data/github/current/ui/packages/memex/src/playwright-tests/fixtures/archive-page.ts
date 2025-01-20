import {BasePageViewWithMemexApp} from './base-page-view'

export class ArchivePage extends BasePageViewWithMemexApp {
  PAGE = this.page.getByTestId('archive-page')
  ITEM_COUNT = this.page.getByTestId('archive-item-count')
  ITEM_LIST = this.page.getByTestId('archived-item-list')
  ITEM = this.ITEM_LIST.locator('li')
  SELECT_ALL_CHECKBOX = this.page.getByRole('checkbox', {name: 'Toggle select all items'})
  FILTER_INPUT = this.PAGE.getByRole('combobox', {name: 'Filter by keyword or by field'})
}
