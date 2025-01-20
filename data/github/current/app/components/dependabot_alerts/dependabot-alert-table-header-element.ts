import {controller, target, targets} from '@github/catalyst'

@controller
class DependabotAlertTableHeaderElement extends HTMLElement {
  #abortController: AbortController

  alertSelectedCount = 0

  @target alertsBulkActionContainer: HTMLElement
  @target alertsSelectedCountText: HTMLElement
  @targets bulkActionItemsContainers: HTMLElement[]
  @target filterContainer: HTMLElement

  connectedCallback() {
    // The abortController and its signal will be used for aborting
    // the event handlers registered with `addEventListener` when
    // the element is disconnected.
    this.#abortController = new AbortController()
    const {signal} = this.#abortController

    window.addEventListener('alertCheckboxChange', this, {signal})
  }

  disconnectedCallback() {
    this.#abortController.abort()
  }

  handleEvent(event: CustomEvent) {
    // `handleEvent` will be called when each one of the event listeners
    // defined in `connectedCallback` is dispatched.
    if (event.type !== 'alertCheckboxChange') {
      return
    }

    this.handleCheckboxChange(event)
  }

  handleCheckboxChange(event: CustomEvent) {
    if (event.detail.checked) {
      this.alertSelectedCount++
    } else {
      this.alertSelectedCount--
    }

    const showBulkEdit = this.alertSelectedCount > 0
    this.alertsSelectedCountText.hidden = !showBulkEdit
    this.alertsBulkActionContainer.hidden = !showBulkEdit
    this.filterContainer.hidden = showBulkEdit

    this.addOrRemoveAlertFromBulkActionForms(event)
  }

  addOrRemoveAlertFromBulkActionForms(event: CustomEvent) {
    for (const container of this.bulkActionItemsContainers) {
      if (event.detail.checked) {
        const input = document.createElement('input')
        input.setAttribute('type', 'hidden')
        input.setAttribute('name', 'ids[]')
        input.setAttribute('value', event.detail.value)
        container.appendChild(input)
      } else {
        const inputElement = container.querySelector(`
          input[name="ids[]"][value="${event.detail.value}"]
        `)
        if (inputElement) {
          container.removeChild(inputElement)
        }
      }
    }
  }
}
