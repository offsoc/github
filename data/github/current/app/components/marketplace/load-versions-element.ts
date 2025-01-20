import {controller, target} from '@github/catalyst'
import {parseHTML} from '@github-ui/parse-html'

@controller
class LoadVersionsElement extends HTMLElement {
  @target button: HTMLElement
  @target list: HTMLElement

  get disabled(): boolean {
    return this.button.hasAttribute('aria-disabled')
  }

  set disabled(value: boolean) {
    if (value) {
      this.button.setAttribute('aria-disabled', 'true')
    } else {
      this.button.removeAttribute('aria-disabled')
    }
    this.button.classList.toggle('disabled', value)
  }

  async getMoreVersions(e: Event) {
    e.preventDefault()
    if (this.disabled) return
    this.disabled = true
    const url = this.getAttribute('data-url')
    if (!url) throw new Error('cannot fetch the next versions, no url set')
    const totalPage = parseInt(this.getAttribute('data-total-page') || '1')
    let page = parseInt(this.getAttribute('data-page') || '1')
    page = page + 1
    const fetchUrl = `${url}?page=${page}`
    try {
      const response = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      if (!response.ok) return
      const html = await response.text()
      if (page >= totalPage) {
        this.button.hidden = true
      }
      const content = parseHTML(document, html)
      this.list?.appendChild(content)
      this.setAttribute('data-page', page.toString())
      this.disabled = false
    } catch (error) {
      this.disabled = false
      return
    }
  }
}
