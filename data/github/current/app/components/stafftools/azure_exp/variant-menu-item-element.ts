import {controller, target} from '@github/catalyst'
import {toggleToast} from '@github-ui/toggle-toast'

@controller
export class VariantMenuItemElement extends HTMLElement {
  @target form: HTMLFormElement

  assignVariant() {
    this.form?.requestSubmit()
    this.showToast()
  }

  showToast() {
    toggleToast(document.querySelector('.js-azure-exp-local-assignments-toast')?.innerHTML, {
      closeAfter: 5000,
    })
  }
}
