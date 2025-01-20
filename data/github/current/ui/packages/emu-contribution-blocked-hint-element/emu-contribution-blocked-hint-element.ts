import {controller, target} from '@github/catalyst'

@controller
export class EMUContributionBlockedHintElement extends HTMLElement {
  @target popoverElem: HTMLElement

  handlePopoverToggle() {
    if (this.popoverElem) {
      this.popoverElem.hidden = !this.popoverElem.hidden
    }
  }
}
