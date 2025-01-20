import {controller, target} from '@github/catalyst'
import type {GenerateCopilotSummaryPayload} from '@github-ui/copilot-summarize-banner-element/types'
import {GenerateCopilotSummaryEvent} from '@github-ui/copilot-summarize-banner-element/events'

@controller
export class CopilotSummarizeBannerStaffbarControlsElement extends HTMLElement {
  @target form: HTMLFormElement | undefined
  @target dialog: HTMLDialogElement | undefined
  @target customPromptSummarizeButton: HTMLButtonElement | undefined

  submitHandler = (event: SubmitEvent) => this.#handleFormSubmit(event)

  connectedCallback() {
    this.form?.addEventListener('submit', this.submitHandler)
  }

  disconnectedCallback() {
    this.form?.removeEventListener('submit', this.submitHandler)
  }

  #handleFormSubmit(event: SubmitEvent) {
    event.preventDefault() // don't actually submit the form
    const data = new FormData(this.form)
    const prompt = data.get('copilot_summary_prompt')?.toString()
    if (!prompt) return

    const payload: GenerateCopilotSummaryPayload = {prompt}
    window.dispatchEvent(new GenerateCopilotSummaryEvent(payload))
    this.dialog?.close()

    // enable the button again so the user can submit the form again without reloading the page
    if (this.customPromptSummarizeButton) this.customPromptSummarizeButton.disabled = false
  }
}
