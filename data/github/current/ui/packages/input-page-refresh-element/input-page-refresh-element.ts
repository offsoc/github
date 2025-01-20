import {controller, target, attr} from '@github/catalyst'

@controller
export class InputPageRefreshElement extends HTMLElement {
  @target searchInput: HTMLInputElement
  @attr tab: string

  private timeout: number | null = null

  async connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search)
    const orgSearch = urlParams.get('org_search')
    if (orgSearch && orgSearch.length >= 1) {
      this.searchInput.focus()
      const strLength = this.searchInput.value.length * 2
      this.searchInput.setSelectionRange(strLength, strLength)
    }
  }

  search() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = window.setTimeout(() => {
      const searchQuery = this.searchInput.value
      const url = new URL(window.location.toString(), window.location.origin)
      url.searchParams.set('org_search', searchQuery)
      url.searchParams.set('tab', this.tab)
      window.location.href = url.toString()
    }, 1000)
  }
}
