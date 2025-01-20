import {controller, target, targets, attr} from '@github/catalyst'
import type FilterInputElement from '@github/filter-input-element'
import {parseHTML} from '@github-ui/parse-html'
import type RemotePaginationElement from '../../github/remote-pagination-element'

@controller
class FeaturedWorkElement extends HTMLElement {
  @targets checkboxes: HTMLInputElement[]
  @target limitNotice: HTMLElement
  @target repoList: HTMLElement
  @target editDialog: HTMLDialogElement
  @target error: HTMLElement
  @target filterInput: FilterInputElement
  @target input: HTMLInputElement
  @target remotePagination: RemotePaginationElement
  @target form: HTMLFormElement

  @attr previewUrl = ''
  @attr searchUrl = ''
  @attr page = 1

  autoreloadCount = 100

  get selectedRepoIds(): string[] {
    return this.checkboxes.filter((node: HTMLInputElement) => node.checked).map(node => node.value)
  }

  get maxRepoCount(): number {
    return parseInt(this.getAttribute('max')!, 10)
  }

  toggleRepository() {
    this.trackSelectedRepoCount()
    this.validateCheckboxes()
  }

  validateCheckboxes() {
    const disablement = this.selectedRepoIds.length >= this.maxRepoCount
    for (const checkbox of this.checkboxes) {
      if (checkbox.checked) continue

      checkbox.disabled = disablement
    }
  }

  async trackSelectedRepoCount() {
    await Promise.resolve()
    const maxRepos = parseInt(this.getAttribute('max')!, 10)
    // Update the message displaying how many repos are selected
    const selectedCount = this.selectedRepoIds.length
    const label = this.limitNotice.getAttribute('data-remaining-label')
    this.limitNotice.textContent = `${selectedCount} ${label}`

    // Change color of the notice when only one repo remains
    const diff = maxRepos - selectedCount
    this.limitNotice.classList.toggle('color-fg-danger', diff <= 1)
  }

  async handleSubmit() {
    if (this.invalidRepoCount()) {
      this.error.removeAttribute('hidden')
      return
    }
    const url = new URL(this.previewUrl, window.location.origin)
    for (const id of this.selectedRepoIds) {
      url.searchParams.append('repo_ids[]', id)
    }
    const response = await fetch(url)
    const html = await response.text()
    const fragment = parseHTML(document, html)
    this.repoList.replaceChildren(fragment)
    this.editDialog.close()
  }

  invalidRepoCount(): boolean {
    return this.selectedRepoIds.length > this.maxRepoCount
  }

  private filter() {
    this.input.dispatchEvent(new Event('change', {bubbles: true}))
  }

  private setFilteringLogic() {
    this.filterInput.filter = (item: HTMLElement, itemText: string, term: string) => {
      const trimmedTerm = term.toLowerCase().trim()

      if (item.querySelector('input:checked')) return {match: true}

      const matchesQuery = !trimmedTerm || itemText.toLowerCase().indexOf(trimmedTerm.toLowerCase()) > -1
      return {match: matchesQuery}
    }
  }

  private loadMoreItems() {
    if (!this.remotePagination.hasNextPage) return

    if (this.autoreloadCount === 0) return

    this.autoreloadCount--

    this.remotePagination.addEventListener('remote-pagination-load', this.loadMoreItems.bind(this), {
      once: true,
    })
    this.remotePagination.loadNextPage()
  }
}
