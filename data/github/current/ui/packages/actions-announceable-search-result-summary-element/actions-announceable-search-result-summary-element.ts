import {announceFromElement} from '@github-ui/aria-live'
import {controller, target} from '@github/catalyst'

// For pages that display a search result on load.
// This will announce the search result after a short delay for screen readers.

@controller
export class ActionsAnnounceableSearchResultSummaryElement extends HTMLElement {
  @target searchResult: HTMLElement

  connectedCallback() {
    setTimeout(() => {
      this.#announceSearchResult()
    }, 200)
  }

  #announceSearchResult() {
    if (this.searchResult.textContent === '') {
      return
    }

    announceFromElement(this.searchResult)
  }
}
