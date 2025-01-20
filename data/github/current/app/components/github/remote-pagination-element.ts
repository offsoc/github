import {controller, target, targets} from '@github/catalyst'
import {parseHTML} from '@github-ui/parse-html'
import {requestSubmit} from '@github-ui/form-utils'

@controller
export default class RemotePaginationElement extends HTMLElement {
  @target form: HTMLFormElement
  @target list: HTMLElement
  @targets focusMarkers: HTMLElement[]
  @target submitButton: HTMLButtonElement
  loaderWasFocused = false

  connectedCallback() {
    this.setPaginationUrl(this.list)
  }

  get hasNextPage(): boolean {
    return !this.form.hidden
  }

  loadNextPage() {
    if (!this.hasNextPage) return
    requestSubmit(this.form)
  }

  get disabled(): boolean {
    return this.submitButton.hasAttribute('aria-disabled')
  }

  set disabled(value: boolean) {
    if (value) {
      this.submitButton.setAttribute('aria-disabled', 'true')
    } else {
      this.submitButton.removeAttribute('aria-disabled')
    }
    this.submitButton.classList.toggle('disabled', value)
  }

  private loadstart(event: Event) {
    ;(event.target as HTMLElement).addEventListener(
      'focus',
      () => {
        this.loaderWasFocused = true
      },
      {once: true},
    )
    ;(event.target as HTMLElement).addEventListener(
      'include-fragment-replaced',
      () => {
        this.setPaginationUrl(this.list)
        if (this.loaderWasFocused) {
          this.focusMarkers.pop()?.focus()
        }
        this.loaderWasFocused = false
      },
      {once: true},
    )
  }

  private async submit(event: Event) {
    event.preventDefault()
    if (this.disabled) return
    this.disabled = true
    let html
    try {
      const response = await fetch(this.form.action)
      if (!response.ok) return
      html = await response.text()
    } catch {
      return
    }
    const fragment = parseHTML(document, html)
    this.setPaginationUrl(fragment)
    this.list.append(fragment)
    this.focusMarkers.pop()?.focus()
    this.disabled = false
    this.dispatchEvent(new CustomEvent('remote-pagination-load'))
  }

  private setPaginationUrl(container: HTMLElement | DocumentFragment) {
    const destinationEl = container.querySelector('[data-pagination-src]')
    if (!destinationEl) return
    const url = destinationEl.getAttribute('data-pagination-src')
    if (url) {
      this.form.action = encodeURI(url)
      this.form.hidden = false
    } else {
      this.form.hidden = true
    }
  }
}
