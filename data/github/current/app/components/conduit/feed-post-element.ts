import {debounce} from '@github/mini-throttle/decorators'
import {controller, target} from '@github/catalyst'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'

@controller
export class FeedPostElement extends HTMLElement {
  @target textArea: HTMLTextAreaElement
  @target form: HTMLFormElement
  @target errorMessage: HTMLElement
  @target dialog: HTMLElement
  @target hiddenClose: HTMLElement
  @target embedPreview: HTMLElement | null

  embedCache: Map<string, Node> = new Map()

  connectedCallback() {
    if (this.dialog) {
      this.dialog.addEventListener('cancel', () => this.handleDialogCancel())
    }
  }

  handleFormSubmit(e: Event) {
    e.preventDefault()
    if (this.form.checkValidity()) {
      this.submitFeedPostCreate()
    } else {
      this.showErrorMessage(true)
    }
  }

  handleTextAreaFocus() {
    this.textArea.classList.remove('color-border-danger-emphasis')
    this.showErrorMessage(false)

    if (this.embedPreview) {
      this.scanForURL(this.textArea)
    }
  }

  showErrorMessage(state = true) {
    if (state) {
      this.textArea.classList.add('color-border-danger-emphasis')
    } else {
      this.textArea.classList.remove('color-border-danger-emphasis')
    }

    this.errorMessage.hidden = !state
  }

  handleDialogCancel() {
    // firing a hydro click event even if the dialog was closed via escape key
    if (this.embedPreview) {
      this.embedPreview.textContent = ''
    }
    this.hiddenClose.click()
  }

  handleDialogOpen() {
    this.textArea.value = ''
    this.showErrorMessage(false)
    setTimeout(() => this.textArea.focus(), 10)
  }

  scanForURL(textArea: HTMLTextAreaElement) {
    const urlExp =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi
    const regex = new RegExp(urlExp)
    const text = textArea.value
    const matches = text.match(regex)

    if (matches && matches.length > 0) {
      const match = matches[matches.length - 1]
      if (match) {
        this.processEmbedUrl(match)
      }
    } else {
      if (this.embedPreview) {
        this.embedPreview.textContent = ''
      }
    }
  }

  @debounce(300)
  async processEmbedUrl(url: string) {
    const fragment = await this.fetchEmbed(url)
    if (fragment && this.embedPreview) {
      this.embedPreview.replaceChildren(fragment)
    }
  }

  async fetchEmbed(url: string) {
    try {
      if (this.embedCache.has(url)) {
        return this.embedCache.get(url)?.cloneNode(true)
      }

      const path = this.textArea.getAttribute('data-embed-url')
      if (!path) return

      const encoded = encodeURIComponent(url)
      const fragment = await fetchSafeDocumentFragment(document, `${path}?url=${encoded}`)
      this.embedCache.set(url, fragment.cloneNode(true))

      return fragment
    } catch (error) {
      return ''
    }
  }

  async submitFeedPostCreate(): Promise<void | {response: Response}> {
    const formData = new FormData(this.form)
    let fragment: DocumentFragment
    try {
      fragment = await fetchSafeDocumentFragment(document, this.form.action, {
        method: this.form.method,
        body: formData,
        headers: {
          Accept: 'text/html',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
    } catch {
      const errMsg = this.errorMessage.getAttribute('creation-failure-message')
      if (errMsg) this.errorMessage.textContent = errMsg
      this.showErrorMessage(true)
      return
    }
    const close = document.querySelector('[data-close-dialog-id="create-feed-post-dialog"]')
    if (close instanceof HTMLElement) close.click()

    const container = document.querySelector('.js-for-you-feed-items')
    container?.prepend(fragment)
  }
}
