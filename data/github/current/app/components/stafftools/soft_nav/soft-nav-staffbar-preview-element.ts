import {controller, attr} from '@github/catalyst'
import {hasTurboLoaded} from '@github-ui/turbo/utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {SoftNavErrorEvent, SoftNavSuccessEvent, type SoftNavMechanism} from '@github-ui/soft-nav/events'

type StaffbarState = Lowercase<keyof typeof SOFT_NAV_STATE>

@controller
class SoftNavStaffbarPreviewElement extends HTMLElement {
  @attr state: StaffbarState
  @attr visitCount = '3'
  @attr isFrameLoad = false
  @attr isReact = false

  #abortController: AbortController | null = null

  connectedCallback() {
    if (hasTurboLoaded()) {
      this.render()
    } else {
      const {signal} = (this.#abortController = new AbortController())
      document.addEventListener(
        SOFT_NAV_STATE.INITIAL,
        () => {
          this.render()
        },
        {once: true, signal},
      )
    }
  }

  disconnectedCallback() {
    this.#abortController?.abort()
  }

  async render() {
    // prevent a possible re-render from the `SOFT_NAV_STATE.INITIAL` event listener
    this.#abortController?.abort()

    await window.customElements.whenDefined('soft-nav-staffbar')

    switch (this.state) {
      case 'success': {
        this.emitSuccess(Number(this.visitCount), this.mechanism)
        break
      }
      case 'error': {
        this.emitError('error')
        break
      }
      default: {
        this.emitInitial()
        break
      }
    }
  }

  get mechanism(): SoftNavMechanism {
    if (this.isFrameLoad) return 'turbo.frame'
    if (this.isReact) return 'react'

    return 'turbo'
  }

  emitInitial() {
    document.dispatchEvent(new Event(SOFT_NAV_STATE.INITIAL))
  }

  emitSuccess(visitCount: number, mechanism: SoftNavMechanism = 'turbo') {
    document.dispatchEvent(new SoftNavSuccessEvent(mechanism, visitCount))
  }

  emitError(reason: string) {
    document.dispatchEvent(new SoftNavErrorEvent('turbo', reason))
  }
}
