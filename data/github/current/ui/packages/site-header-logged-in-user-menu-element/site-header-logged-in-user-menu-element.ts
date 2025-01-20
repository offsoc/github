import {controller, target} from '@github/catalyst'

@controller
export class SiteHeaderLoggedInUserMenuElement extends HTMLElement {
  @target popoverElem: HTMLElement
  @target detailsElem: HTMLDetailsElement

  connectedCallback() {
    if (!this.popoverElem) return
    this.popoverElem.hidden = false

    if (!this.detailsElem) return
    this.detailsElem.addEventListener('toggle', () => this.handleDetailsToggle())
  }

  handleDetailsToggle() {
    this.popoverElem.hidden = this.detailsElem.open ? true : false
  }
}
