import {controller} from '@github/catalyst'

@controller
export class CopilotMarketingPopoverElement extends HTMLElement {
  connectedCallback() {
    this.displayFirstPopover()
  }

  displayFirstPopover() {
    const firstPopoverOnPage: HTMLElement | null = document.querySelector('copilot-marketing-popover')

    if (this && firstPopoverOnPage) {
      if (this.isEqualNode(firstPopoverOnPage)) {
        this.removeAttribute('hidden')
      }
    }
  }
}
