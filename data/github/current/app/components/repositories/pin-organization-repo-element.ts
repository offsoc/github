import {controller, target} from '@github/catalyst'
import {hasDirtyFields} from '@github-ui/has-interactions'

@controller
class PinOrganizationRepoElement extends HTMLElement {
  @target form: HTMLFormElement
  @target submitButton: HTMLButtonElement

  async formModified() {
    this.submitButton.disabled = !hasDirtyFields(this.form)
  }
}
