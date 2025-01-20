import {controller, target} from '@github/catalyst'

@controller
class AlertDismissalElement extends HTMLElement {
  @target footer: HTMLElement
  @target form: HTMLFormElement

  connectedCallback() {
    this.hide()
  }

  hide() {
    this.form.reset()
    this.footer.hidden = true
  }

  show() {
    this.footer.hidden = false
  }
}
