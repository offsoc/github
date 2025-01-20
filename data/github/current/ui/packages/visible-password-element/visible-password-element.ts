import {controller, target} from '@github/catalyst'

@controller
export class VisiblePasswordElement extends HTMLElement {
  @target input: HTMLInputElement | undefined
  @target showButton: HTMLElement | undefined
  @target hideButton: HTMLElement | undefined

  show() {
    if (this.input && this.showButton && this.hideButton) {
      this.input.type = 'text'
      this.input.focus()
      this.showButton.hidden = true
      this.hideButton.hidden = false
    }
  }

  hide() {
    if (this.input && this.showButton && this.hideButton) {
      this.input.type = 'password'
      this.input.focus()
      this.hideButton.hidden = true
      this.showButton.hidden = false
    }
  }
}
