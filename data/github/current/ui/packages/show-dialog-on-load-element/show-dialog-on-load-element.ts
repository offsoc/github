import {controller, target} from '@github/catalyst'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'

@controller
export class ShowDialogOnLoadElement extends HTMLElement {
  @target dialog: ModalDialogElement | HTMLDialogElement

  connectedCallback() {
    const param = this.getAttribute('data-url-param')?.trim()
    const display = this.getAttribute('data-display') === 'true'
    if (param && window.location.search.includes(param)) {
      this.showDialog()
    } else if (display) {
      this.showDialog()
    }
  }

  showDialog() {
    if (this.dialog instanceof HTMLDialogElement) {
      this.dialog.showModal()
    } else {
      this.dialog.open = true
    }
  }

  hideDialog() {
    if (this.dialog instanceof HTMLDialogElement) {
      this.dialog.close()
    } else {
      this.dialog.open = false
    }
  }
}
