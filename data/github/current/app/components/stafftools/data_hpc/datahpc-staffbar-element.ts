import {controller} from '@github/catalyst'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

@controller
class DatahpcStaffbarElement extends HTMLElement {
  observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue

        if (node.hasAttribute('data-hpc') || node.querySelector('[data-hpc]')) {
          this.hidden = true
          this.observer.disconnect()
        }
      }
    }
  })

  connectedCallback() {
    window.addEventListener('load', this.checkDataHpcApp)

    document.addEventListener(SOFT_NAV_STATE.INITIAL, this.checkDataHpcApp)
    document.addEventListener(SOFT_NAV_STATE.END, this.checkDataHpcApp)

    if (!this.dataHPCElement) this.observer.observe(document.body, {childList: true, subtree: true})
  }

  disconnectedCallback() {
    window.removeEventListener('load', this.checkDataHpcApp)

    document.removeEventListener(SOFT_NAV_STATE.INITIAL, this.checkDataHpcApp)
    document.removeEventListener(SOFT_NAV_STATE.END, this.checkDataHpcApp)

    this.observer.disconnect()
  }

  checkDataHpcApp = () => {
    requestAnimationFrame(() => {
      this.hidden = Boolean(this.dataHPCElement)
    })
  }

  get dataHPCElement() {
    return document.querySelector('[data-hpc]')
  }
}
