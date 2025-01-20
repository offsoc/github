import {controller, target} from '@github/catalyst'

@controller
/* The fallback SMS configuration happens via rendering of a Primer Dialog component.
   However, we would like to trigger the dialog from a different button than the "show button" of the Dialog component.
   This Catalyst component will "click" the (hidden) Dialog component show button, when our real trigger button is clicked.
 */
class TwoFactorFallbackSmsConfigToggleElement extends HTMLElement {
  static attrPrefix = ''
  @target button: HTMLButtonElement

  showFallbackSmsModal() {
    if (this.button.hasAttribute('data-sudo-required')) {
      // sudo modal has not been completed, this will be refired after it is
      return
    }
    const dialogTrigger = document.getElementsByClassName('fallback-configure')[0] as HTMLButtonElement
    dialogTrigger.click()
  }
}
