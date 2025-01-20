import {controller, target, targets, attr} from '@github/catalyst'
import {ItemsProvider} from '../../../../../assets/modules/github/side-panel/items-provider'
import type {QueryBuilderElement, FeedbackEvent} from '@github-ui/query-builder-element'
import {debounce} from '@github/mini-throttle/decorators'

// An internal fork of Primer's <nav-list-group> element to add filtering and change the pagination behavior
@controller
export class InternalNavListGroupElement extends HTMLElement {
  @attr src: string
  @attr itemsPerPage: number
  @attr maxPages: number
  @attr currentPage = 1
  @attr inputId: string
  @attr filterItemType: string

  @target showMoreItem: HTMLElement
  @target list: HTMLUListElement
  @targets focusMarkers: HTMLElement[]
  @target filterContainer: HTMLElement
  @target showFilterButton: HTMLElement
  @target hideFilterButton: HTMLButtonElement | null
  @target queryBuilder: QueryBuilderElement | null
  @target emptyResultsContainer: HTMLElement | null

  #needsInputLayout = true

  connectedCallback(): void {
    this.toggleShowMoreItemVisibility()
    if (this.queryBuilder) {
      this.addEventListener('query-builder:request-provider', this.connectFilterItemsProvider)
      this.addEventListener('query-builder-feedback', this.toggleEmptyResultsDisplay)
    }
  }

  disconnectedCallback() {
    if (this.queryBuilder) {
      this.removeEventListener('query-builder:request-provider', this.connectFilterItemsProvider)
      this.removeEventListener('query-builder-feedback', this.toggleEmptyResultsDisplay)
    }
  }

  showFilter() {
    if (!this.filterContainer) return

    this.filterContainer.hidden = false
    this.showFilterButton.hidden = true
    if (this.queryBuilder) {
      this.list.hidden = true
      this.#layoutInput()
      this.queryBuilder.input.focus()
    }
  }

  hideFilter() {
    if (!this.filterContainer) return

    this.filterContainer.hidden = true
    if (this.queryBuilder) {
      this.list.hidden = false
      this.queryBuilder.clear()
    }

    if (this.emptyResultsContainer) {
      this.emptyResultsContainer.hidden = true
    }
    this.showFilterButton.hidden = false
    this.showFilterButton.focus()
  }

  get totalItems(): number {
    const childCount = this.list.children.length

    if (this.showMoreItem) {
      return childCount - 1
    }

    return childCount
  }

  get atPageLimit(): boolean {
    return this.currentPage === this.maxPages
  }

  get hasEnoughItems(): boolean {
    return this.totalItems < this.itemsPerPage * this.currentPage
  }

  get hideShowMoreItem(): boolean {
    return this.hasEnoughItems || this.atPageLimit
  }

  get showMoreDisabled(): boolean {
    return this.showMoreItem.hasAttribute('aria-disabled')
  }

  set showMoreDisabled(value: boolean) {
    if (value) {
      this.showMoreItem.setAttribute('aria-disabled', 'true')
    } else {
      this.showMoreItem.removeAttribute('aria-disabled')
    }
    this.showMoreItem.classList.toggle('disabled', value)
  }

  private toggleShowMoreItemVisibility(): void {
    if (this.showMoreItem) {
      this.showMoreItem.hidden = this.hideShowMoreItem
    }
  }

  private async showMore(e: Event) {
    e.preventDefault()

    if (this.showMoreDisabled) return
    this.showMoreDisabled = true

    let html
    try {
      const paginationURL = new URL(this.src, window.location.origin)
      this.currentPage++
      paginationURL.searchParams.append('page', this.currentPage.toString())
      const response = await fetch(paginationURL)
      if (!response.ok) return
      html = await response.text()
    } catch (err) {
      // Ignore network errors
      this.showMoreDisabled = false
      this.currentPage--
      return
    }

    const fragment = this.#parseHTML(document, html)
    fragment?.querySelector('li > a')?.setAttribute('data-targets', 'internal-nav-list-group.focusMarkers')
    this.list.insertBefore(fragment, this.showMoreItem)
    this.focusMarkers.pop()?.focus()
    this.showMoreDisabled = false
    this.toggleShowMoreItemVisibility()
  }

  #parseHTML(document: Document, html: string): DocumentFragment {
    const template = document.createElement('template')
    template.innerHTML = html
    return document.importNode(template.content, true)
  }

  #layoutInput() {
    if (!this.#needsInputLayout) return
    if (!this.queryBuilder) return
    if (!this.hideFilterButton) return

    const div = document.createElement('div')
    div.classList.add('d-flex')

    const parent = this.queryBuilder.styledInput.parentNode

    if (parent) {
      parent.insertBefore(div, this.queryBuilder.styledInput)
    }

    div.appendChild(this.queryBuilder.styledInput)
    div.appendChild(this.hideFilterButton)
    const hideFilterButtonTooltip = document.querySelector(`[for="${this.hideFilterButton.id}"]`)
    if (hideFilterButtonTooltip) {
      div.appendChild(hideFilterButtonTooltip)
    }

    this.#needsInputLayout = false
  }

  connectFilterItemsProvider(event: Event) {
    const queryBuilderId = `query-builder-query-${this.inputId}`
    const queryBuilder: QueryBuilderElement | null = event.target as QueryBuilderElement
    if (!queryBuilder || queryBuilder.id !== queryBuilderId) return

    new ItemsProvider(event.target as QueryBuilderElement, this.filterItemType)
  }

  @debounce(200)
  toggleEmptyResultsDisplay(event: Event) {
    if (!this.emptyResultsContainer) return
    if (!this.queryBuilder) return
    const feedbackEvent = event as FeedbackEvent
    if (feedbackEvent.key !== 'NEW_RESULTS') return

    const suggestionsText = this.queryBuilder.i18n.suggestion
    const pattern = new RegExp(`(\\d+)\\s+${suggestionsText}`)
    const match = feedbackEvent.text.match(pattern)

    if (!match) return
    const numResults = match[1]

    if (numResults === '0' && this.emptyResultsContainer.hidden) {
      this.emptyResultsContainer.hidden = false
    } else if (numResults !== '0' && !this.emptyResultsContainer.hidden) {
      this.emptyResultsContainer.hidden = true
    }
  }
}
