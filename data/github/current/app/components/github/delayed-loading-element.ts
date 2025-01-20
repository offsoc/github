import {controller} from '@github/catalyst'

const DefaultDelayMs = '500'

@controller
class DelayedLoadingElement extends HTMLElement {
  showAfterMs: number

  connectedCallback() {
    this.showAfterMs = parseInt(this.getAttribute('data-show-after-ms') || DefaultDelayMs)
    setTimeout(() => {
      this.style.display = 'block'
    }, this.showAfterMs)
  }
}
