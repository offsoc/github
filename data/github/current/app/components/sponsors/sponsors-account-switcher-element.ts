import {controller, target} from '@github/catalyst'
import type {ActionMenuElement} from '@primer/view-components/app/components/primer/alpha/action_menu/action_menu_element'
import {sendHydroEvent} from '../../assets/modules/github/hydro-tracking'

@controller
class SponsorsAccountSwitcherElement extends HTMLElement {
  @target actionMenu: ActionMenuElement

  connectedCallback() {
    const popoverElement = this.actionMenu?.popoverElement
    if (!popoverElement) {
      return
    }
    popoverElement.addEventListener('toggle', (event: Event) => this.handleToggle(event))
  }

  handleToggle(event: Event) {
    const toggleEvent = event as ToggleEvent
    if (toggleEvent.newState === 'open') {
      sendHydroEvent(this.actionMenu)
    }
  }
}
