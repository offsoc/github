import {controller, target, attr} from '@github/catalyst'

@controller
export class IntegrationAgentFormElement extends HTMLElement {
  @target agent: HTMLDivElement | undefined
  @target switcher: HTMLInputElement | undefined
  @attr useswitcher = false

  connectedCallback() {
    this.switchForm()
  }

  switchForm() {
    if (!this.agent || !this.switcher) {
      return
    }

    if (!this.useswitcher) {
      return
    }

    switch (this.switcher.value) {
      case 'agent':
        this.agent.hidden = false
        break
      case 'disabled':
        this.agent.hidden = true
        break
    }
  }
}
