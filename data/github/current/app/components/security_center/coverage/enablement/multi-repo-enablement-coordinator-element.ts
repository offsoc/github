import {controller, target} from '@github/catalyst'
import type SelectionChangeEvent from './selection-change-event'
import type TableItemSelectionElement from './table-item-selection-element'
import type MultiRepoEnablementElement from './multi-repo-enablement-element'

@controller
export default class MultiRepoEnablementCoordinatorElement extends HTMLElement {
  @target enablementDialog: MultiRepoEnablementElement
  @target selectedRepoIds: HTMLInputElement
  @target tableItemSelection: TableItemSelectionElement
  @target useQuery: HTMLInputElement

  handleRepoSelectionChange(event: SelectionChangeEvent): void {
    const {count: selectedReposCount, useQuery} = event
    this.selectedRepoIds.value = this.getSelectedRepoIds().join(',')
    this.useQuery.value = useQuery.toString()
    this.enablementDialog.selectedReposCount = selectedReposCount
  }

  private getSelectedRepoIds(): string[] {
    return this.tableItemSelection.visibleItemCheckboxes
      .filter((input: HTMLInputElement) => input.checked)
      .map(input => input.value)
  }
}
