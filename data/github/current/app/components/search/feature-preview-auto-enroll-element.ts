import {controller, target} from '@github/catalyst'

@controller
class FeaturePreviewAutoEnrollElement extends HTMLElement {
  @target button: HTMLButtonElement
  connectedCallback() {
    this.button.click()
  }
}
