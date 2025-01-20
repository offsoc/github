import {controller} from '@github/catalyst'

@controller
class EditorForwarderElement extends HTMLElement {
  async connectedCallback() {
    this.closeDetailsPopover()
    const codespaceUrl = this.getAttribute('data-codespace-url')
    if (codespaceUrl) window.location.href = encodeURI(codespaceUrl)
  }

  closeDetailsPopover() {
    // Now that we've finished polling we want to close the <details> popover where we were showing the
    // loading animation to maintain symmetry with the other creation flows.
    const details = document.querySelector<HTMLDetailsElement>('.js-codespaces-details-container')!
    if (details) {
      details.open = false
    }
  }
}
