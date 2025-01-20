import {controller, target} from '@github/catalyst'

@controller
class RecoveryCodesElement extends HTMLElement {
  @target warning: HTMLElement

  saveCodes() {
    this.warning.classList.remove('flash-error')
    this.warning.classList.add('flash-info')

    const inlineBanner = document.querySelector<HTMLElement>('.inline-recovery-codes-banner')
    if (inlineBanner) {
      inlineBanner.hidden = true
    }
  }
}
