import {controller, target} from '@github/catalyst'
import type {MemexProjectPickerElement} from '../memex-project-picker-element'
import {ActionType} from './project-buttons-list-element'
import type {MemexProjectPickerPanelElement} from '../memex-project-picker-panel-element'

@controller
class MemexProjectPickerUnlinkElement extends HTMLElement {
  @target button: HTMLButtonElement

  unlinkProject(event: MouseEvent) {
    event.preventDefault()

    document.getElementById('action-type-control')?.setAttribute('value', ActionType.Link)

    const pickerForm = document.getElementById('js-project-picker-form')
    const picker =
      pickerForm?.querySelector<MemexProjectPickerElement>('memex-project-picker') ||
      pickerForm?.querySelector<MemexProjectPickerPanelElement>('memex-project-picker-panel')

    if (!picker) return

    const numberStr = this.button.getAttribute('data-number')
    if (!numberStr) return

    const number = parseInt(numberStr)

    // Unlink project can only operate on 1 project at a time
    const removeSucceeded = picker.removeItem(
      this.button.getAttribute('data-name') || '',
      number,
      this.button.getAttribute('data-owner') || '',
    )

    if (removeSucceeded) picker.triggerUpdate(event)
  }
}
