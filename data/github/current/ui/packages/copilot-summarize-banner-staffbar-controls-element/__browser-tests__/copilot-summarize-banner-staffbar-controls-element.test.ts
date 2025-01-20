import {assert, fixture, html, setup, suite, test, waitUntil} from '@github-ui/browser-tests'
import {CopilotSummarizeBannerStaffbarControlsElement} from '../copilot-summarize-banner-staffbar-controls-element'
import type {GenerateCopilotSummaryEvent} from '@github-ui/copilot-summarize-banner-element/events'

// Run these tests via:
// npm run test:watch ui/packages/copilot-summarize-banner-staffbar-controls-element/__browser-tests__/copilot-summarize-banner-staffbar-controls-element.test.ts
suite('copilot-summarize-banner-staffbar-controls-element', () => {
  let container: CopilotSummarizeBannerStaffbarControlsElement

  setup(async function () {
    container = await fixture(html`
      <copilot-summarize-banner-staffbar-controls>
        <dialog open data-target="copilot-summarize-banner-staffbar-controls.dialog">
          <form data-target="copilot-summarize-banner-staffbar-controls.form">
            <textarea name="copilot_summary_prompt"></textarea>
            <button type="submit" data-target="copilot-summarize-banner-staffbar-controls.customPromptSummarizeButton">
              Summarize
            </button>
          </form>
        </dialog>
      </copilot-summarize-banner-staffbar-controls>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopilotSummarizeBannerStaffbarControlsElement)
    assert.instanceOf(container.dialog, HTMLDialogElement)
    assert.instanceOf(container.form, HTMLFormElement)
    assert.instanceOf(container.customPromptSummarizeButton, HTMLButtonElement)
  })

  test('submitting the form closes the dialog', async () => {
    assert.isTrue(container.dialog?.open)
    container.customPromptSummarizeButton?.click()
    waitUntil(() => !container.dialog?.open, 'expected submitting the form to close the dialog')
  })

  test('submitting the form emits an event', () => {
    let eventCount = 0
    let submittedPrompt: string | null = null
    window.addEventListener('generate-copilot-summary', (event: GenerateCopilotSummaryEvent) => {
      eventCount++
      submittedPrompt = event.payload.prompt
    })
    const textarea = container.form?.querySelector('textarea')
    assert.instanceOf(textarea, HTMLTextAreaElement)
    if (textarea) textarea.textContent = 'Hello world'

    container.customPromptSummarizeButton?.click()

    waitUntil(() => eventCount === 1, 'expected an event to be emitted')
    assert.equal('Hello world', submittedPrompt)
  })

  test('user is able to submit form twice with different prompts', () => {
    let eventCount = 0
    let submittedPrompt: string | null = null
    window.addEventListener('generate-copilot-summary', (event: GenerateCopilotSummaryEvent) => {
      eventCount++
      submittedPrompt = event.payload.prompt
    })
    const textarea = container.form?.querySelector('textarea')
    assert.instanceOf(textarea, HTMLTextAreaElement)
    if (textarea) textarea.textContent = 'Hello world'

    container.customPromptSummarizeButton?.click()
    waitUntil(() => eventCount === 1, 'expected an event to be emitted')
    assert.equal('Hello world', submittedPrompt)

    waitUntil(() => !container.dialog?.open, 'expected submitting the form to close the dialog')
    if (container.dialog) container.dialog.open = true // reopen the dialog
    assert.isFalse(container.customPromptSummarizeButton?.disabled)

    if (textarea) textarea.textContent = 'Another one'
    container.customPromptSummarizeButton?.click()

    waitUntil(() => eventCount === 2, 'expected another event to be emitted')
    assert.equal('Another one', submittedPrompt)
  })
})
