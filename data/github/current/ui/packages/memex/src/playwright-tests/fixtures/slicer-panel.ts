import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'
import {Filter} from './filter'

export class SlicerPanel extends BasePageViewWithMemexApp {
  SLICER_PANEL = this.page.getByTestId('slicer-panel')
  SLICER_PANEL_TITLE = this.SLICER_PANEL.getByTestId('slicer-panel-title')
  LIST_ITEMS = this.SLICER_PANEL.getByRole('listitem')
  TOGGLE_EMPTY_ITEMS_BUTTON = this.SLICER_PANEL.getByTestId('toggle-empty-slicer-items')
  filter = new Filter(this.page, this.memex, this.page.getByTestId('slicer-panel-filter-input'))
  RESIZER_SASH = this.page.getByTestId('slicer-panel-resizer-sash')
  DESELECT = this.SLICER_PANEL.getByRole('button', {name: 'Deselect'})

  async expectTitle(value: string) {
    await expect(this.SLICER_PANEL_TITLE).toHaveText(value)
  }

  async expectListItemCount(count: number) {
    await expect(this.LIST_ITEMS).toHaveCount(count)
  }

  async expectListItemToContainText(index: number, value: string) {
    await expect(this.LIST_ITEMS.nth(index)).toContainText(value)
  }

  async expectListItemToHaveCount(index: number, value: number) {
    await expect(this.LIST_ITEMS.nth(index).getByTestId('slicer-item-count')).toContainText(`${value}`)
  }

  async expectListItemToHaveProgress(index: number, value: string) {
    await expect(this.LIST_ITEMS.nth(index).getByTestId('progress-text')).toContainText(`${value}`)
  }
}
