import {attr, controller, target, targets} from '@github/catalyst'
import SelectionChangeEvent from './selection-change-event'

@controller
export default class TableItemSelectionElement extends HTMLElement {
  @attr allForFilterCount = 0
  @target itemsSelectedOptions: HTMLElement
  @target noItemsSelectedOptions: HTMLElement
  @target resetButton: HTMLInputElement
  @target selectAllForFilterButton: HTMLInputElement
  @target selectAllVisibleCheckbox: HTMLInputElement
  @target selectedCount: HTMLElement
  @targets visibleItemCheckboxes: HTMLInputElement[]

  connectedCallback() {
    this.reset()
  }

  reset(): void {
    this.resetButton.hidden = true
    this.setCheckedStateForElements([...this.visibleItemCheckboxes, this.selectAllVisibleCheckbox], false)
    this.toggleSelectionOptions()
  }

  selectAllForFilter(): void {
    this.selectAllForFilterButton.hidden = true
    this.resetButton.hidden = false
    this.setCheckedStateForElements([...this.visibleItemCheckboxes, this.selectAllVisibleCheckbox], true)
    this.setSelectedCount(true)
  }

  toggleSelectAllVisible(): void {
    if (this.allVisibleSelected) {
      this.reset()
      return
    }

    this.setCheckedStateForElements(
      [...this.visibleItemCheckboxes, this.selectAllVisibleCheckbox],
      this.selectAllVisibleCheckbox.checked,
    )
    this.toggleSelectionOptions()
  }

  toggleVisibleItem(): void {
    const noneSelected = !this.anyVisibleSelected
    if (noneSelected) {
      this.reset()
      return
    }

    const allVisibleSelected = this.allVisibleSelected
    this.setCheckedStateForElements(
      [this.selectAllVisibleCheckbox],
      allVisibleSelected,
      !allVisibleSelected && this.visibleItemsSelectedCount > 0,
    )
    this.resetButton.hidden = true
    this.toggleSelectionOptions()
  }

  private setCheckedStateForElements(elements: HTMLInputElement[], checked: boolean, indeterminate = false): void {
    for (const element of elements) {
      if (!element) continue
      element.checked = checked
      element.indeterminate = indeterminate
    }
  }

  private setSelectAllForFilterButtonVisibility(): void {
    this.selectAllForFilterButton.hidden =
      !this.allVisibleSelected || this.visibleItemsSelectedCount === this.allForFilterCount
  }

  private setSelectedCount(useAllForFilterCount = false): void {
    const selectedCount = useAllForFilterCount
      ? this.allForFilterCount
      : this.visibleItemCheckboxes.filter(item => item.checked).length
    this.selectedCount.textContent = String(selectedCount)
    this.dispatchEvent(new SelectionChangeEvent(selectedCount, useAllForFilterCount))
  }

  private toggleSelectionOptions(): void {
    this.noItemsSelectedOptions.hidden = this.anyVisibleSelected
    this.itemsSelectedOptions.hidden = !this.anyVisibleSelected

    this.setSelectAllForFilterButtonVisibility()
    this.setSelectedCount()
  }

  private get allVisibleSelected(): boolean {
    return this.visibleItemCheckboxes.every(item => item.checked)
  }

  private get anyVisibleSelected(): boolean {
    return this.visibleItemCheckboxes.some(item => item.checked)
  }

  private get visibleItemsSelectedCount(): number {
    return this.visibleItemCheckboxes.filter(item => item.checked).length
  }
}
