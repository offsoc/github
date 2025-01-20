import {controller, target} from '@github/catalyst'

@controller
export class ChangePasswordElement extends HTMLElement {
  @target showPasswordSectionButtonText: HTMLSpanElement | undefined
  @target hidePasswordSectionButtonText: HTMLSpanElement | undefined
  @target changePasswordSection: HTMLDivElement | undefined
  @target changePasswordInformationSection: HTMLDivElement | undefined
  @target button: HTMLButtonElement | undefined

  connectedCallback() {
    if (this.button) this.button.disabled = false
    this.#hideSection()
  }

  toggleChangePasswordSection() {
    if (this.changePasswordSection && this.changePasswordSection.hidden) {
      this.#showSection()
    } else {
      this.#hideSection()
    }
  }

  #hideSection() {
    if (this.changePasswordSection) this.changePasswordSection.hidden = true
    if (this.changePasswordInformationSection) this.changePasswordInformationSection.hidden = false
    if (this.showPasswordSectionButtonText) this.showPasswordSectionButtonText.hidden = false
    if (this.hidePasswordSectionButtonText) this.hidePasswordSectionButtonText.hidden = true
  }

  #showSection() {
    if (this.changePasswordSection) this.changePasswordSection.hidden = false
    if (this.changePasswordInformationSection) this.changePasswordInformationSection.hidden = true
    if (this.showPasswordSectionButtonText) this.showPasswordSectionButtonText.hidden = true
    if (this.hidePasswordSectionButtonText) this.hidePasswordSectionButtonText.hidden = false
  }
}
