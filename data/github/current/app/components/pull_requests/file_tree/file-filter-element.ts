import {controller, target, targets} from '@github/catalyst'
import {sendHydroEvent} from '../../../assets/modules/github/hydro-tracking'
import {updateURLState} from '../../../assets/modules/github/diffs/file-filter-persistence'

@controller
export class FileFilterElement extends HTMLElement {
  // FILTER STATE
  @target deletedFilesInput: HTMLInputElement | undefined
  @target manifestFilesInput: HTMLInputElement | undefined
  @target viewedFilesInput: HTMLInputElement
  @targets codeownersFilterInputs: HTMLInputElement[]
  @targets fileExtensions: HTMLInputElement[]

  @target selectAllContainer: HTMLElement
  @target fileFilterActiveText: HTMLElement
  @targets fileTypeCount: HTMLInputElement[]

  // focus element within the file filter element
  @target summary: HTMLElement

  connectedCallback() {
    this.updateFileInputs()
    this.updateFilterState()
  }

  updateFileInputs(event?: Event) {
    if (event) {
      this.instrumentFilterToggle(event)
    }

    const changeEvent = {
      hideDeletedFiles: this.shouldHideDeletedFiles,
      hideViewedFiles: this.shouldHideViewedFiles,
      showManifestFilesOnly: this.shouldShowManifestFilesOnly,
      selectedOwners: Array.from(this.selectedOwners()),
      showCodeownersFiles: this.shouldShowOwnedFilesOnly,
      selectedFileTypes: Array.from(this.selectedFileTypes()),
      fileTypeFilterActive: this.fileTypeFilterActive,
      filtersActive: this.filtersActive,
    }

    this.dispatchEvent(new CustomEvent('file-filter-change', {detail: changeEvent}))
    this.updateFilterState()
    this.updateUrl()
  }

  clearFilters(): void {
    this.resetDefaultFilters()
    this.updateFileInputs()
  }

  updateFilterState() {
    this.activateFilterHighlight()
    this.toggleSelectAll()
    this.toggleFileTypeCounts()
    this.toggleAvailableOptions()
  }

  enableAllFileInputs(): void {
    if (!this.fileTypeFilterActive) return

    for (const checkbox of this.fileExtensions) {
      checkbox.checked = true
    }

    this.updateFileInputs()
  }

  private get filtersActive(): boolean {
    return (
      this.fileTypeFilterActive ||
      this.shouldShowOwnedFilesOnly ||
      this.shouldHideDeletedFiles ||
      this.shouldHideViewedFiles ||
      this.shouldShowManifestFilesOnly
    )
  }

  private activateFilterHighlight(): void {
    if (this.filtersActive) {
      this.fileFilterActiveText.classList.toggle('color-fg-accent', true)
    } else {
      this.fileFilterActiveText.classList.toggle('color-fg-accent', false)
    }
  }

  private toggleSelectAll(): void {
    const typeFilterActive = this.fileTypeFilterActive
    const selectedMarkup = this.fileTypeFilterActive ? 'data-select-all-markup' : 'data-all-selected-markup'
    const newMarkup = this.selectAllContainer.getAttribute(selectedMarkup)!
    this.selectAllContainer.textContent = newMarkup
    this.selectAllContainer.classList.toggle('color-fg-muted', !typeFilterActive)
    this.selectAllContainer.classList.toggle('color-fg-accent', typeFilterActive)
  }

  private toggleFileTypeCounts(): void {
    for (const count of this.fileTypeCount) {
      const countMarkup = this.shouldHideDeletedFiles
        ? 'data-non-deleted-file-count-markup'
        : 'data-all-file-count-markup'

      const newMarkup = count.getAttribute(countMarkup)
      if (newMarkup) {
        count.textContent = newMarkup
      }
    }
  }

  private toggleAvailableOptions() {
    // Disables file types that consist of only deleted files when deleted files filter is active
    for (const checkbox of this.fileExtensions) {
      if (this.shouldHideDeletedFiles) {
        const allFilesDeleted = checkbox.getAttribute('data-non-deleted-files-count') === '0'
        checkbox.disabled = allFilesDeleted
      } else {
        checkbox.disabled = false
      }
    }
  }

  private instrumentFilterToggle(event: Event): void {
    const filterInput = event.currentTarget as HTMLElement
    const isChecked = (filterInput as HTMLInputElement).checked
    const hydroContextAttributes = {file_filter_checked: isChecked}
    filterInput.setAttribute('data-hydro-client-context', JSON.stringify(hydroContextAttributes))
    sendHydroEvent(filterInput)
  }

  private get fileTypeFilterActive(): boolean {
    return Array.from(this.selectedFileTypes()).length !== this.fileExtensions.length
  }

  private get whitespaceFilterActive(): boolean {
    const params = new URLSearchParams(window.location.search)
    return params.has('w')
  }

  *selectedFileTypes() {
    for (const option of this.fileExtensions) {
      if (option.checked) {
        yield option.value
      }
    }
  }

  private get shouldShowOwnedFilesOnly(): boolean {
    return Array.from(this.selectedOwners()).length > 0
  }

  *selectedOwners() {
    for (const option of this.codeownersFilterInputs) {
      if (option.checked) {
        yield option.value
      }
    }
  }

  private get shouldShowManifestFilesOnly(): boolean {
    return !!this.manifestFilesInput?.checked
  }

  private get shouldHideDeletedFiles(): boolean {
    return !!this.deletedFilesInput && !this.deletedFilesInput.checked
  }

  private get shouldHideViewedFiles(): boolean {
    return !this.viewedFilesInput.checked
  }

  private resetDefaultFilters(): void {
    if (this.deletedFilesInput) {
      this.deletedFilesInput.checked = true
    }

    if (this.manifestFilesInput) {
      this.manifestFilesInput.checked = false
    }

    for (const input of this.codeownersFilterInputs) {
      input.checked = false
    }

    for (const input of this.fileExtensions) {
      input.checked = true
    }

    this.viewedFilesInput.checked = true

    // return focus to summary element after clearing filters
    this.summary.focus()
  }

  private updateUrl(): void {
    updateURLState(
      this.fileTypeFilterActive,
      this.whitespaceFilterActive,
      Array.from(this.selectedFileTypes()),
      this.shouldShowOwnedFilesOnly,
      Array.from(this.selectedOwners()),
      this.shouldShowManifestFilesOnly,
      this.shouldHideDeletedFiles,
      this.shouldHideViewedFiles,
    )
  }
}
