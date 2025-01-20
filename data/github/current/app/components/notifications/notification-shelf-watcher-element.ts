import {attr, controller} from '@github/catalyst'
import {updateContent} from '@github-ui/updatable-content'
import {getStoredShelfParamsForCurrentPage} from '../../assets/modules/github/notifications/v2/notification-shelf-referrer-params'

/**
 * NotificationShelfWatcherElement
 * This element will load the notification top shelf bar asynchronously to reduce the page dependency with notifications clusters
 * It will also listen to channel updates to update the form. This is done because some notifications are marked as read asynchronously
 * which means the form might not have the latest data on first load
 */
@controller
export class NotificationShelfWatcherElement extends HTMLElement {
  @attr baseUrl: string
  @attr refreshDelay = 500 // ms

  src: string | void
  timeout: ReturnType<typeof setTimeout> | void

  connectedCallback() {
    this.preload()
    this.update()
    this.addEventListener('socket:message', this.update.bind(this))
  }

  preload() {
    this.src = this.preloadSrc()
  }

  preloadSrc(): string {
    const src = this.getAttribute('src')
    if (src && src !== '') {
      const link = this.ownerDocument.createElement('a')
      link.href = src
      return link.href
    }

    // Try to load the src from the storage
    // This is useful for when the page is reloaded and it doesn't have the notification_referrer_id in the URL
    // anymore because it was removed on first load
    if (!this.baseUrl) {
      return ''
    }

    const params = getStoredShelfParamsForCurrentPage()
    if (!params) {
      return ''
    }

    const shelfURL = new URL(this.baseUrl, window.location.origin)
    const searchParams = new URLSearchParams(shelfURL.search)

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        searchParams.set(key, value)
      }
    }
    shelfURL.search = searchParams.toString()

    return shelfURL.toString()
  }

  async update() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    if (!this.src || this.src === '') {
      return
    }

    const el = this.placeholder()
    if (!el) {
      return
    }

    const isInitial = el.hasAttribute('data-initial')

    el.setAttribute('data-url', this.src)
    await updateContent(el)

    if (isInitial) {
      this.refresh()
    }
  }

  placeholder(): HTMLElement | null {
    return document.querySelector<HTMLElement>("[data-target='notification-shelf-watcher.placeholder']")
  }

  refresh() {
    const el = this.placeholder()
    if (!el) {
      return
    }

    const inner = el.querySelector("[data-notification-status='unread']")

    // First time loading and the content is shown as unread. This could be because the
    // `mark_as_read` action in the controller was delayed. Try to fetch it again.
    if (inner) {
      this.timeout = setTimeout(() => this.update(), this.refreshDelay)
    }
  }
}
