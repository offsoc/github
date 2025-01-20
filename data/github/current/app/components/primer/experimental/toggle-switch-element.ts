import {controller, target} from '@github/catalyst'

@controller
export class ToggleSwitchElement extends HTMLElement {
  @target switch: HTMLElement

  toggle() {
    if (this.isOn()) {
      this.turnOff()
    } else {
      this.turnOn()
    }
  }

  turnOn(): void {
    if (this.isDisabled()) {
      return
    }

    this.switch.setAttribute('aria-checked', 'true')
    this.classList.add('ToggleSwitch--checked')
  }

  turnOff(): void {
    if (this.isDisabled()) {
      return
    }

    this.switch.setAttribute('aria-checked', 'false')
    this.classList.remove('ToggleSwitch--checked')
  }

  isOn(): boolean {
    return this.switch.getAttribute('aria-checked') === 'true'
  }

  isDisabled(): boolean {
    return this.switch.getAttribute('aria-disabled') === 'true'
  }
}
