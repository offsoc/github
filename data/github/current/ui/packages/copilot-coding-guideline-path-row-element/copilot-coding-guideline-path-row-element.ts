import {controller, target} from '@github/catalyst'

@controller
export class CopilotCodingGuidelinePathRowElement extends HTMLElement {
  @target destroyInput!: HTMLInputElement

  // Will mark the row for deletion and hide it. The CodingGuidelinePath won't be deleted until
  // the form is submitted and Rails updates the Copilot::CodingGuideline and
  // associated Copilot::CodingGuidelinePath records via
  // accepts_nested_attributes_for.
  markForDestroy(event: Event) {
    // Handled by CopilotCodingGuidelineFormElement to show the blankslate if there are no rows left.
    this.dispatchEvent(new CustomEvent('coding-guideline-path-marked-for-destroy', {bubbles: true}))
    event.stopPropagation()
    this.hidden = true
    this.destroyInput.value = 'true' // This will tell Rails to destroy the record via accepts_nested_attributes_for
  }
}
