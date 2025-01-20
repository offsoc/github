import {attr, controller, target} from '@github/catalyst'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'

@controller
class DeferredSidePanelElement extends HTMLElement {
  @attr url: string
  @target fragment: HTMLElement
  @target panel: ModalDialogElement

  loadPanel() {
    // the fragment target gets removed from the document once the panel has loaded,
    // so we don't need to run setup again even if this element is reconnected
    if (!this.fragment || this.fragment.hasAttribute('data-loaded')) return

    this.fragment.setAttribute('src', this.url)

    this.fragment.addEventListener('include-fragment-replace', event => {
      if (event instanceof CustomEvent && event.detail.fragment) {
        const newFragment = event.detail.fragment
        const oldDialog = this.fragment.querySelector('modal-dialog, dialog')
        const newDialog = newFragment.querySelector('modal-dialog, dialog')
        if (!oldDialog || !newDialog) return

        // manually swap out the dialog contents,
        // injecting the new dialog children into the old dialog
        event.preventDefault()
        this.fragment.removeAttribute('src')
        this.fragment.setAttribute('data-loaded', '')
        oldDialog.replaceChildren(...newDialog.children)
        // Ensure the IDs are the same
        // FIXME: if we applied well known IDs we could delete the below code.
        for (const el of oldDialog.querySelectorAll('[data-close-dialog-id],[data-show-dialog-id]')) {
          if (el.getAttribute('data-close-dialog-id') === newDialog.id) {
            el.setAttribute('data-close-dialog-id', oldDialog.id)
          }
          if (el.getAttribute('data-show-dialog-id') === newDialog.id) {
            el.setAttribute('data-show-dialog-id', oldDialog.id)
          }
        }
      }
    })
  }
}
