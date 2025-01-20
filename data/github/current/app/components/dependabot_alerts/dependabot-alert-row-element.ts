import {controller, target} from '@github/catalyst'

@controller
class DependabotAlertRowElement extends HTMLElement {
  @target checkbox: HTMLInputElement

  dispatchCheckboxChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('alertCheckboxChange', {
        bubbles: true,
        detail: {
          value: this.checkbox.value,
          checked: this.checkbox.checked,
        },
      }),
    )
  }
}
