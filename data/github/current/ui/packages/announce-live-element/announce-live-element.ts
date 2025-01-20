import {controller, target} from '@github/catalyst'
import {announceFromElement} from '@github-ui/aria-live'

@controller
export class AnnounceLiveElement extends HTMLElement {
  @target container: HTMLElement

  connectedCallback() {
    if (this.container) {
      announceFromElement(this.container)
    }
  }
}
