import {controller} from '@github/catalyst'
import {sendHydroEvent} from '../../assets/modules/github/hydro-tracking'

@controller
export class DialogHydroElement extends HTMLElement {
  connectedCallback() {
    this.attachHydroEvents()
  }

  attachHydroEvents() {
    this.attachCloseHydroEvent()
  }

  attachCloseHydroEvent() {
    const dialogCloseButton: HTMLElement | null = this.querySelector('div[data-close-dialog-id]')

    if (this && dialogCloseButton) {
      dialogCloseButton?.addEventListener('click', () => sendHydroEvent(this))
    }
  }
}
