import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {CopilotReviewFeedbackElement} from '../copilot-review-feedback-element'

suite('copilot-review-feedback-element', () => {
  let container: CopilotReviewFeedbackElement

  setup(async function () {
    container = await fixture(html`
      <copilot-review-feedback>
        <div data-target="copilot-review-feedback.voteUpButton"></div>
        <div data-target="copilot-review-feedback.voteDownButton"></div>
        <div data-target="copilot-review-feedback.feedbackCheckboxes"></div>
        <div data-target="copilot-review-feedback.submitButton"></div>
        <div data-target="copilot-review-feedback.form"></div>
      </copilot-review-feedback>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopilotReviewFeedbackElement)
  })
})
