import {attr, controller, target} from '@github/catalyst'
import {fetchRetry} from '@github-ui/fetch-utils'

@controller
export class NotificationIndicatorElement extends HTMLElement {
  @attr indicatorMode = 'none'
  @attr headerRedesignEnabled = false
  @attr fetchIndicatorEnabled = false
  @attr fetchRetryDelayTime = 500 // ms

  @target badge: HTMLElement
  @target link: HTMLAnchorElement
  @target tooltip: HTMLElement

  connectedCallback() {
    this.toggleBadge()
    this.updateAriaLabel()
    this.fetchIndicatorMode()
  }

  indicatorModeUpdated() {
    this.updateAriaLabel()
    this.toggleBadge()
    this.updateTrackingEvent()
  }

  toggleBadge() {
    if (this.headerRedesignEnabled) {
      if (!this.link) return

      if (this.hasUnreadNotifications) {
        this.link.classList.add('AppHeader-button--hasIndicator')
      } else {
        this.link.classList.remove('AppHeader-button--hasIndicator')
      }
    } else {
      if (!this.badge) return
      this.badge.hidden = !this.hasUnreadNotifications
    }
  }

  updateAriaLabel() {
    if (this.tooltip) {
      this.tooltip.textContent = this.ariaLabelForMode
    }
  }

  updateTrackingEvent() {
    if (!this.link) {
      return
    }

    const analyticsEvent = this.link.getAttribute('data-analytics-event') || '{}'
    const analyticsEventAttributes = JSON.parse(analyticsEvent)
    const iconState = this.hasUnreadNotifications ? 'unread' : 'read'

    analyticsEventAttributes.label = `icon:${iconState}`
    this.link.setAttribute('data-analytics-event', JSON.stringify(analyticsEventAttributes))
  }

  get hasUnreadNotifications(): boolean {
    return this.indicatorMode === 'global'
  }

  get ariaLabelForMode(): string {
    const defaultAriaLabel = this.getAttribute('data-tooltip-none') || ''
    const ariaLabelForMode = this.getAttribute(`data-tooltip-${this.indicatorMode}`)

    return ariaLabelForMode || defaultAriaLabel
  }

  update(event: Event) {
    if (!this.link || !this.badge) return
    const data = (event as CustomEvent).detail.data
    this.indicatorMode = data.indicator_mode
  }

  async fetchIndicatorMode() {
    try {
      if (!this.fetchIndicatorEnabled) {
        return
      }

      if (!this.link) {
        return
      }

      const path = this.getAttribute('data-fetch-indicator-src')
      if (!path) {
        return
      }

      const response = await fetchRetry(
        path,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
        {
          wait: this.fetchRetryDelayTime,
        },
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()

      if (data.mode === 'disabled') {
        this.hidden = true
      } else {
        this.hidden = false
      }

      this.indicatorMode = data.mode
    } catch {
      // Ignore network errors
      return
    } finally {
      // Always enable socket messages after fetching (or not) the indicator mode from the API call
      this.addEventListener('socket:message', this.update.bind(this))
    }
  }

  static observedAttributes = ['data-indicator-mode']

  attributeChangedCallback(attribute: string, oldValue: string, newValue: string) {
    if (attribute === 'data-indicator-mode' && oldValue !== newValue) {
      this.indicatorModeUpdated()
    }
  }
}
