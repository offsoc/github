import {controller, target} from '@github/catalyst'

@controller
class CloseReasonSelectorElement extends HTMLElement {
  @target selectedIconContainer: HTMLElement

  handleSelection(event: CustomEvent) {
    const selection = event.detail.relatedTarget as HTMLElement
    const icon = selection.querySelector('[data-close-reason-icon]') as HTMLElement
    this.selectedIconContainer.innerHTML = icon.innerHTML
  }
}
