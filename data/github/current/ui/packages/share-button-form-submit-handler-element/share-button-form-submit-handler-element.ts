import {controller, target, targets} from '@github/catalyst'

@controller
export class ShareButtonFormSubmitHandlerElement extends HTMLElement {
  @target form: HTMLFormElement

  submit() {
    this.form.submit()
  }
}

@controller
export class ShareButtonTextHandlerElement extends HTMLElement {
  @targets text: HTMLInputElement[]
  @target share_text: HTMLInputElement | HTMLTextAreaElement

  updateText() {
    for (const element of this.text) {
      element.value = this.share_text.value
    }
  }
}
