import {TemplateInstance, propertyIdentityOrBooleanAttribute} from '@github/template-parts'
import {controller, target} from '@github/catalyst'
import type {MemexProjectPickerElement} from '../memex-project-picker-element'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'
import type {MemexProjectPickerPanelElement} from '../memex-project-picker-panel-element'

@controller
export class MemexProjectPickerInterstitialElement extends HTMLElement {
  @target dialog: ModalDialogElement | HTMLDialogElement
  @target linkContent: HTMLTemplateElement
  @target unlinkContent: HTMLTemplateElement
  @target container: HTMLDivElement
  @target submitButton: HTMLButtonElement

  show(event: Event) {
    event.preventDefault()
    event.stopPropagation()

    const picker = this.findPicker()
    if (!picker) return

    const input = this.findInput(picker)
    if (!input) return

    const name = input.getAttribute('data-project-name')
    const owner = input.getAttribute('data-project-owner')
    if (!name || !owner) return

    // When the interstitial is triggered - set the filter input to the selected value.
    // This can come from the action menu, or from the picker directly.
    // We need this for maintaining the state between the picker and action menu.
    this.updateFilterInput(picker, name)

    let content = null
    let scheme = ''

    if (input.checked) {
      content = this.linkContent
      scheme = this.linkContent.getAttribute('data-scheme') || 'default'
    } else {
      content = this.unlinkContent
      scheme = this.unlinkContent.getAttribute('data-scheme') || 'default'
    }

    this.container.replaceChildren(...[new TemplateInstance(content, {}, propertyIdentityOrBooleanAttribute)])

    this.submitButton.textContent = input.checked ? 'Add team as collaborator' : 'Remove team as collaborator'
    this.submitButton.className = `btn btn-${scheme}`

    if (this.dialog instanceof HTMLDialogElement) {
      this.dialog.showModal()
    } else if (this.dialog) {
      this.dialog.show()
    }
  }

  closing() {
    const picker = this.findPicker()
    if (!picker) return
    const input = this.findInput(picker)
    if (!input) return

    const number = input.getAttribute('data-project-number')
    const owner = input.getAttribute('data-project-owner')
    if (!number || !owner) return

    const label = picker.list?.querySelector<HTMLLabelElement>(`#pp-${owner}-${number}`)
    if (!label) return

    label.ariaChecked = label.ariaChecked === 'true' ? 'false' : 'true'
    picker.resetSelectionDiff()
    picker.submitContainer.replaceChildren()

    // If the picker isn't open - then we've come from the action menu
    // So let's clear the filter input so the picker is back to it's base state
    if (!picker.open) this.updateFilterInput(picker)
  }

  private updateFilterInput(
    picker: MemexProjectPickerElement | MemexProjectPickerPanelElement | null = null,
    value = '',
  ) {
    if (!picker && !(picker = this.findPicker())) return

    picker.filterInput.value = value
    picker.filterInput.dispatchEvent(new Event('input', {bubbles: true}))
  }

  private findPicker(): MemexProjectPickerElement | MemexProjectPickerPanelElement | null {
    const form = document.getElementById('js-project-picker-form')
    if (!form) return null

    return (
      form.querySelector<MemexProjectPickerElement>('memex-project-picker') ||
      form.querySelector<MemexProjectPickerPanelElement>('memex-project-picker-panel')
    )
  }

  private findInput(picker: MemexProjectPickerElement | MemexProjectPickerPanelElement | null = null) {
    if (!picker && !(picker = this.findPicker())) return
    return (picker.submitContainer.firstElementChild as HTMLInputElement) || null
  }
}
