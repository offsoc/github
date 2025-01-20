import {controller, attr} from '@github/catalyst'

@controller
export class PortalFragmentElement extends HTMLElement {
  @attr targetElement = 'body'

  connectedCallback() {
    if (this.parentNode !== this.targetNode) {
      this.targetNode?.appendChild(this)
    }
  }

  get targetNode() {
    return this.closest(this.targetElement)
  }
}
