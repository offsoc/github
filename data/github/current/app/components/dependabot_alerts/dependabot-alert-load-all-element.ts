import {controller, target} from '@github/catalyst'

@controller
class DependabotAlertLoadAllElement extends HTMLElement {
  @target timelineEvents: HTMLElement
  @target paginationLoader: HTMLElement

  displayRemainingEvents() {
    this.timelineEvents.toggleAttribute('hidden')
    this.paginationLoader.toggleAttribute('hidden')
  }
}
