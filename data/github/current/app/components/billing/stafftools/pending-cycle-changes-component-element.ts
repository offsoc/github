import {controller, target} from '@github/catalyst'

@controller
class PendingCycleChangesComponentElement extends HTMLElement {
  @target togglePendingPlanChangesButton: HTMLButtonElement
  @target pendingPlanChangesContainer: HTMLElement
  #showPendingPlanChanges = false

  togglePendingPlanChanges() {
    this.#showPendingPlanChanges = !this.#showPendingPlanChanges
    this.#renderOutput()
  }

  #renderOutput = () => {
    this.togglePendingPlanChangesButton.classList.toggle('open', this.#showPendingPlanChanges)
    this.pendingPlanChangesContainer.hidden = !this.#showPendingPlanChanges
  }
}
