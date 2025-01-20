import {attr, controller} from '@github/catalyst'

@controller
class TimeoutContentElement extends HTMLElement {
  @attr show = false
  @attr delayMs: number

  private setTimeoutId: number | null = null

  connectedCallback() {
    this.setTimeoutId = setTimeout(() => {
      this.style.display = this.show ? '' : 'none'
    }, this.delayMs) as unknown as number
  }

  disconnectedCallback() {
    if (this.setTimeoutId !== null) {
      clearTimeout(this.setTimeoutId)
      this.setTimeoutId = null
    }
  }
}
