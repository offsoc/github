import {controller, target, targets} from '@github/catalyst'

@controller
class LazyLoadSectionElement extends HTMLElement {
  @target list: HTMLElement
  @target showMoreItem: HTMLElement
  @targets focusMarkers: HTMLElement[]

  get disabled(): boolean {
    return this.showMoreItem.hasAttribute('aria-disabled')
  }

  set disabled(value: boolean) {
    if (value) {
      this.showMoreItem.setAttribute('aria-disabled', 'true')
    } else {
      this.showMoreItem.removeAttribute('aria-disabled')
    }
    this.showMoreItem.classList.toggle('disabled', value)
  }

  set current_page(value: number) {
    this.showMoreItem.setAttribute('data-current-page', value.toString())
  }

  get current_page(): number {
    return parseInt(this.showMoreItem.getAttribute('data-current-page') as string) || 1
  }

  get total_pages(): number {
    return parseInt(this.showMoreItem.getAttribute('pages') as string) || 1
  }

  get pagination_src(): string {
    return this.showMoreItem.getAttribute('src') || ''
  }

  connectedCallback() {
    this.setShowMoreItemState()
  }

  private async submit(e: Event) {
    e.preventDefault()
    if (this.disabled) return
    this.disabled = true
    let html
    try {
      const paginationURL = new URL(this.pagination_src, window.location.origin)
      this.current_page++
      paginationURL.searchParams.append('page', this.current_page.toString())
      const response = await fetch(paginationURL)
      if (!response.ok) return
      html = await response.text()
      if (this.current_page === this.total_pages) {
        this.showMoreItem.hidden = true
      }
    } catch (err) {
      // Ignore network errors
      this.disabled = false
      this.current_page--
      return
    }
    const fragment = this.parseHTML(document, html)
    fragment?.querySelector('li > a')?.setAttribute('data-targets', 'lazy-load-section.focusMarkers')
    this.list.insertBefore(fragment, this.showMoreItem)
    this.focusMarkers.pop()?.focus()
    this.disabled = false
  }

  private setShowMoreItemState() {
    if (this.current_page < this.total_pages) {
      this.showMoreItem.hidden = false
    } else {
      this.showMoreItem.hidden = true
    }
  }

  private parseHTML(document: Document, html: string): DocumentFragment {
    const template = document.createElement('template')
    template.innerHTML = html
    return document.importNode(template.content, true)
  }
}
