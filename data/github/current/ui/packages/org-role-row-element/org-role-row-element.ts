import {controller, target} from '@github/catalyst'

@controller
export class OrgRoleRowElement extends HTMLElement {
  @target permissionDetails: HTMLElement
  @target showDetailsButton: HTMLButtonElement
  @target hideDetailsButton: HTMLButtonElement

  showDetails() {
    this.permissionDetails.hidden = false
    this.hideDetailsButton.hidden = false
    this.showDetailsButton.hidden = true
  }

  hideDetails() {
    this.permissionDetails.hidden = true
    this.hideDetailsButton.hidden = true
    this.showDetailsButton.hidden = false
  }
}
