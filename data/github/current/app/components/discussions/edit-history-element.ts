import {controller, target} from '@github/catalyst'
import {TemplateInstance} from '@github/template-parts'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'

@controller
class EditHistoryElement extends HTMLElement {
  @target menuTrigger: HTMLButtonElement
  @target diffDialogTemplate: HTMLTemplateElement
  @target deletedDialogTemplate: HTMLTemplateElement

  displayDiffDialog(event: Event) {
    const button = event.currentTarget as HTMLButtonElement
    const dialogId = button.getAttribute('data-dialog-id')!
    const editor = button.getAttribute('data-editor')!
    const src = button.getAttribute('data-src')!

    const diffTemplate = new TemplateInstance(this.diffDialogTemplate, {dialogId, editor, src})
    this.appendChild(diffTemplate)
    this.showDialog(dialogId)
  }

  displayDeletedDialog(event: Event) {
    const button = event.currentTarget as HTMLButtonElement
    const dialogId = button.getAttribute('data-dialog-id')!
    const editor = button.getAttribute('data-editor')!
    const actor = button.getAttribute('data-actor')!
    const datetime = button.getAttribute('data-datetime')!

    const deletedTemplate = new TemplateInstance(this.deletedDialogTemplate, {
      dialogId,
      editor,
      actor,
      datetime,
    })
    this.appendChild(deletedTemplate)
    this.showDialog(dialogId)
  }

  removeDialog(event: Event) {
    const dialog = event.currentTarget as ModalDialogElement
    const dialogContainer = dialog.closest('[data-modal-dialog-overlay]')

    if (dialogContainer) {
      dialogContainer.remove()

      // Refocus the history dropdown button after the dialog is closed
      this.menuTrigger.tabIndex = 0
      this.menuTrigger.focus()
    }
  }

  private showDialog(dialogId: string) {
    const dialog = this.querySelector<ModalDialogElement | HTMLDialogElement>(`#${dialogId}`)

    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal()
    } else if (dialog) {
      dialog.show()
    }
  }
}
