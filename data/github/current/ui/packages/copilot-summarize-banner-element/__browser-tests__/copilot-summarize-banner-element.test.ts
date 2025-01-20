import {assert, fixture, html, setup, suite, test, waitUntil} from '@github-ui/browser-tests'
import {http, HttpResponse} from 'msw'
import {setupWorker} from 'msw/browser'
import {CopilotSummarizeBannerElement} from '../copilot-summarize-banner-element'
import {GenerateCopilotSummaryEvent} from '../events'
import type {GenerateCopilotSummaryPayload} from '../types'
import SummaryCache from '../summary-cache'

// Run these tests via:
// npm run test:watch ui/packages/copilot-summarize-banner-element/__browser-tests__/copilot-summarize-banner-element.test.ts
suite('copilot-summarize-banner-element', () => {
  let container: CopilotSummarizeBannerElement
  const fakeSummarizeEndpointPath = '/some/github/endpoint'
  const fakeFeedbackPath = '/some/feedback/endpoint'
  const initialDescriptiveText = 'summarize this stuff'
  const loadingText = 'loading...'
  const errorText = 'o noes'
  const completeText = "Job's finished"
  const retryText = 'Dust yourself off and try again'
  const newUpdatesText = 'Something has changed'
  const cacheHitText = 'This summary was last generated:'
  let summaryCache: SummaryCache | undefined
  const worker = setupWorker()

  setup(async function () {
    container = await fixture(html`
      <copilot-summarize-banner hidden>
        <span
          data-target="copilot-summarize-banner.descriptiveText"
          data-loading-text="${loadingText}"
          data-error-text="${errorText}"
          data-complete-text="${completeText}"
          data-new-updates-text="${newUpdatesText}"
          data-cache-hit-text="${cacheHitText}"
        >
          ${initialDescriptiveText}
        </span>
        <relative-time hidden data-target="copilot-summarize-banner.summarizationTimeLabel"></relative-time>
        <span data-target="copilot-summarize-banner.newUpdatesIndicator" hidden></span>
        <span data-target="copilot-summarize-banner.earlyAccessLabel" hidden>Super beta</span>
        <div data-target="copilot-summarize-banner.results" hidden></div>
        <div data-target="copilot-summarize-banner.skeletonText" hidden></div>
        <div data-target="copilot-summarize-banner.visibilityText" hidden></div>
        <span data-target="copilot-summarize-banner.copilotBadge"></span>
        <span data-target="copilot-summarize-banner.loadingCopilotBadge" hidden></span>
        <span data-target="copilot-summarize-banner.errorCopilotBadge" hidden></span>
        <button
          data-action="click:copilot-summarize-banner#summarize"
          data-target="copilot-summarize-banner.summarizeButton"
          data-retry-text="${retryText}"
          data-path="${fakeSummarizeEndpointPath}"
        >
          Summarize me
        </button>
        <button
          data-action="click:copilot-summarize-banner#summarize"
          data-target="copilot-summarize-banner.regenerateButton"
          hidden
        >
          Regenerate
        </button>
        <clipboard-copy value="" data-target="copilot-summarize-banner.clipboardCopy" hidden>Copy me</clipboard-copy>
        <div data-target="copilot-summarize-banner.feedback" hidden>
          <button
            data-target="copilot-summarize-banner.positiveFeedbackButton"
            data-action="click:copilot-summarize-banner#submitPositiveFeedback"
            data-path="${fakeFeedbackPath}"
          >
            helpful
          </button>
          <dialog data-target="copilot-summarize-banner.negativeFeedbackDialog">
            <button data-target="copilot-summarize-banner.negativeFeedbackButton">not helpful</button>
            <form data-target="copilot-summarize-banner.negativeFeedbackForm" action="${fakeFeedbackPath}">
              <input id="feedback-choice" type="checkbox" value="UNHELPFUL" name="feedback_choices[]" />
              <textarea name="feedback_text"></textarea>
              <button type="submit">Send feedback</button>
            </form>
          </dialog>
        </div>
      </copilot-summarize-banner>
    `)
    summaryCache = container.cache
    summaryCache?.clear()
    await worker.start()
  })

  teardown(function () {
    worker.stop()
    worker.resetHandlers()
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopilotSummarizeBannerElement)
    assert.isFalse(container.hidden, 'should have shown banner after connecting')
    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.include(
      container.descriptiveText?.textContent,
      initialDescriptiveText,
      'should not have altered starting descriptive text upon connecting component',
    )
    assert.instanceOf(container.results, HTMLElement)
    assert.isTrue(container.results?.hidden)
    assert.instanceOf(container.visibilityText, HTMLElement)
    assert.isTrue(container.visibilityText?.hidden)
    assert.instanceOf(container.summarizeButton, HTMLButtonElement)
    assert.instanceOf(container.copilotBadge, HTMLElement)
    assert.instanceOf(container.loadingCopilotBadge, HTMLElement)
    assert.isTrue(container.loadingCopilotBadge?.hidden)
    assert.instanceOf(container.skeletonText, HTMLElement)
    assert.isTrue(container.skeletonText?.hidden)
    assert.instanceOf(container.errorCopilotBadge, HTMLElement)
    assert.isTrue(container.errorCopilotBadge?.hidden)
    assert.instanceOf(container.feedback, HTMLElement)
    assert.isTrue(container.feedback?.hidden)
    assert.instanceOf(container.positiveFeedbackButton, HTMLButtonElement)
    assert.instanceOf(container.negativeFeedbackDialog, HTMLDialogElement)
    assert.isFalse(container.negativeFeedbackDialog?.open)
    assert.instanceOf(container.negativeFeedbackForm, HTMLFormElement)
    assert.instanceOf(container.negativeFeedbackButton, HTMLButtonElement)
    assert.instanceOf(container.newUpdatesIndicator, HTMLElement)
    assert.isTrue(container.newUpdatesIndicator?.hidden)
    assert.instanceOf(container.earlyAccessLabel, HTMLElement)
    assert.isTrue(container.earlyAccessLabel?.hidden)
    assert.instanceOf(container.regenerateButton, HTMLButtonElement)
    assert.isTrue(container.regenerateButton?.hidden)
    assert.instanceOf(container.clipboardCopy, HTMLElement)
    assert.isTrue(container.clipboardCopy?.hidden)
    assert.equal(container.summaryPath, fakeSummarizeEndpointPath)
    assert.instanceOf(container.cache, SummaryCache)
    assert.instanceOf(container.summarizationTimeLabel, HTMLElement)
    assert.isTrue(container.summarizationTimeLabel?.hidden)
  })

  test('clicking Summarize button shows summary', async () => {
    // eslint-disable-next-line github/unescaped-html-literal
    const fakeSummary = '<p>Hello world</p>'
    let requestCount = 0
    let requestBody: string | undefined
    worker.use(
      http.post(fakeSummarizeEndpointPath, async ({request}) => {
        requestBody = await request.text()
        requestCount++
        return HttpResponse.text(fakeSummary)
      }),
    )

    container.summarizeButton?.click()

    assert.instanceOf(container.summarizeButton, HTMLButtonElement)
    assert.isTrue(container.summarizeButton?.hidden, 'should have hidden summarize button')

    assert.instanceOf(container.loadingCopilotBadge, HTMLElement)
    assert.isFalse(container.loadingCopilotBadge?.hidden, 'should have shown loading badge')

    assert.instanceOf(container.skeletonText, HTMLElement)
    assert.isFalse(container.skeletonText?.hidden, 'should have shown skeleton text')

    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.equal(
      container.descriptiveText?.textContent,
      loadingText,
      'should have set descriptive text to data-loading-text',
    )

    await waitUntil(() => requestCount === 1, 'expected summarize request to be made')

    assert.include(requestBody, 'FormBoundary')
    assert.notInclude(requestBody, 'prompt', 'should not have sent a prompt parameter in summarize request')
    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.equal(
      container.descriptiveText?.textContent,
      completeText,
      'should have set descriptive text to data-complete-text',
    )
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.instanceOf(container.results, HTMLElement)
    assert.isFalse(container.results?.hidden, 'should have shown results')
    assert.instanceOf(container.visibilityText, HTMLElement)
    assert.isFalse(container.visibilityText?.hidden, 'should have shown visibility text')
    assert.equal(container.results?.innerHTML, fakeSummary, 'should have rendered summary HTML')
    assert.instanceOf(container.copilotBadge, HTMLElement)
    assert.isFalse(container.copilotBadge?.hidden, 'should have shown Copilot badge')
    assert.instanceOf(container.loadingCopilotBadge, HTMLElement)
    assert.isTrue(container.loadingCopilotBadge?.hidden, 'should have hidden loading Copilot badge')
    assert.instanceOf(container.skeletonText, HTMLElement)
    assert.isTrue(container.skeletonText?.hidden, 'should have hidden skeleton text')
    assert.instanceOf(container.feedback, HTMLElement)
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
    assert.equal(
      container.clipboardCopy?.getAttribute('value'),
      'Hello world',
      'should have set text to be copied to text value of summary, not HTML',
    )
    assert.equal(summaryCache?.getSummary(), fakeSummary, 'should have cached summary response')

    worker.stop()
    worker.resetHandlers()
  })

  test('listens for generate-copilot-summary event', async () => {
    let requestBody: unknown
    worker.use(
      http.post(fakeSummarizeEndpointPath, async ({request}) => {
        const formData = await request.formData()
        requestBody = Object.fromEntries(formData)
        return HttpResponse.text('some summary')
      }),
    )
    const eventPayload: GenerateCopilotSummaryPayload = {prompt: 'my great new prompt'}

    window.dispatchEvent(new GenerateCopilotSummaryEvent(eventPayload))

    await waitUntil(() => requestBody !== undefined, 'expected POST request to be made')

    assert.equal(JSON.stringify(eventPayload), JSON.stringify(requestBody))
    assert.isTrue(container.feedback?.hidden, 'should hide feedback buttons for custom prompt')
  })

  test('shows error state on error from api', async () => {
    let requestCount = 0
    worker.use(
      http.post(fakeSummarizeEndpointPath, () => {
        requestCount++
        return HttpResponse.error()
      }),
    )

    container.summarizeButton?.click()

    assert.instanceOf(container.summarizeButton, HTMLButtonElement)
    assert.isTrue(container.summarizeButton?.hidden, 'expected summarize button to be hidden')

    assert.instanceOf(container.loadingCopilotBadge, HTMLElement)
    assert.isFalse(container.loadingCopilotBadge?.hidden, 'expected loading badge to be shown')

    assert.instanceOf(container.skeletonText, HTMLElement)
    assert.isFalse(container.skeletonText?.hidden, 'expected skeleton text to be shown')

    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.equal(
      container.descriptiveText?.textContent,
      loadingText,
      'should have set descriptive text to data-loading-text attribute',
    )

    await waitUntil(() => requestCount === 1, 'expected POST request to be made')

    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.equal(
      container.descriptiveText?.textContent,
      errorText,
      'should have set descriptive text to data-error-text',
    )
    assert.isTrue(container.earlyAccessLabel?.hidden, 'should have kept early access indicator hidden')
    assert.instanceOf(container.errorCopilotBadge, HTMLElement)
    assert.isFalse(container.errorCopilotBadge?.hidden, 'expected error badge to be shown')
    assert.instanceOf(container.summarizeButton, HTMLButtonElement)
    assert.isFalse(container.summarizeButton?.hidden, 'expected summarize button to be shown')
    assert.instanceOf(container.skeletonText, HTMLElement)
    assert.isTrue(container.skeletonText?.hidden, 'should have hidden skeleton text')
    assert.equal(
      container.summarizeButton?.textContent,
      retryText,
      'should have set summarize button text to data-retry-text',
    )
    assert.instanceOf(container.feedback, HTMLElement)
    assert.isTrue(container.feedback?.hidden, 'should have hidden feedback buttons')
    assert.isTrue(container.clipboardCopy?.hidden, 'should have hidden copy button')
    assert.isNull(summaryCache?.getSummary(), 'should not have cached error response as summary')

    worker.stop()
    worker.resetHandlers()
  })

  test('submits positive feedback when button is clicked after summarizing', async () => {
    let summarizeRequestCount = 0
    let feedbackRequestCount = 0
    let feedbackRequestBody: unknown
    worker.use(
      http.post(fakeSummarizeEndpointPath, () => {
        summarizeRequestCount++
        return HttpResponse.text('some summary')
      }),
      http.post(fakeFeedbackPath, async ({request}) => {
        feedbackRequestBody = await request.json()
        feedbackRequestCount++
        return new HttpResponse('', {status: 201})
      }),
    )

    // Request summary
    container.summarizeButton?.click()
    await waitUntil(() => summarizeRequestCount === 1, 'expected summarization request to be made')
    assert.instanceOf(container.feedback, HTMLElement)
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')

    // Submit positive feedback
    container.positiveFeedbackButton?.click()
    await waitUntil(() => feedbackRequestCount === 1, 'expected feedback request to be made')
    const expectedFeedbackRequestBody = {feedback_choices: ['POSITIVE']}
    assert.equal(JSON.stringify(feedbackRequestBody), JSON.stringify(expectedFeedbackRequestBody))
    assert.isTrue(container.positiveFeedbackButton?.disabled, 'should have disabled positive feedback button')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have kept early access indicator visible')
    assert.isTrue(container.negativeFeedbackButton?.hidden, 'should have hidden negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have kept copy button visible')
    assert.equal(summaryCache?.getSummaryFeedbackSentiment(), 'positive', 'should have cached feedback type')
  })

  test('submits negative feedback when form is submitted after summarizing', async () => {
    let summarizeRequestCount = 0
    let feedbackRequestCount = 0
    let feedbackRequestBody = ''
    const customFeedbackText = 'some extra commentary'
    worker.use(
      http.post(fakeSummarizeEndpointPath, () => {
        summarizeRequestCount++
        return HttpResponse.text('some summary')
      }),
      http.post(fakeFeedbackPath, async ({request}) => {
        feedbackRequestBody = await request.text()
        feedbackRequestCount++
        return new HttpResponse('', {status: 201})
      }),
    )

    container.summarizeButton?.click()

    await waitUntil(() => summarizeRequestCount === 1, 'expected summarization request to be made')

    assert.instanceOf(container.feedback, HTMLElement)
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')

    const feedbackChoiceCheckbox = container.negativeFeedbackForm?.querySelector('#feedback-choice') as HTMLInputElement
    feedbackChoiceCheckbox.checked = true

    const feedbackTextarea = container.negativeFeedbackForm?.querySelector(
      'textarea[name=feedback_text]',
    ) as HTMLTextAreaElement
    feedbackTextarea.value = customFeedbackText

    const negativeFeedbackSubmitButton = container.negativeFeedbackForm?.querySelector(
      'button[type=submit]',
    ) as HTMLButtonElement
    negativeFeedbackSubmitButton.click()

    await waitUntil(() => feedbackRequestCount === 1, 'expected feedback request to be made')

    assert.include(feedbackRequestBody, 'Content-Disposition: form-data; name="feedback_choices[]"')
    assert.include(feedbackRequestBody, 'Content-Disposition: form-data; name="feedback_text"')
    assert.include(feedbackRequestBody, feedbackChoiceCheckbox.value)
    assert.include(feedbackRequestBody, customFeedbackText)
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have kept early access indicator visible')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have kept copy button visible')
    assert.equal(summaryCache?.getSummaryFeedbackSentiment(), 'negative', 'should have cached feedback type')
  })

  test('Shows regenerate button when there are new updates to discussion', async () => {
    let requestCount = 0
    let feedbackRequestCount = 0
    worker.use(
      http.post(fakeSummarizeEndpointPath, () => {
        requestCount++
        // eslint-disable-next-line github/unescaped-html-literal
        return HttpResponse.text('<p>Hello world</p>')
      }),
      http.post(fakeFeedbackPath, async () => {
        feedbackRequestCount++
        return new HttpResponse('', {status: 201})
      }),
    )

    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.equal(container.descriptiveText?.textContent?.trim(), initialDescriptiveText)

    // Request summary
    container.summarizeButton?.click()
    await waitUntil(() => requestCount === 1, 'expected summarize request to be made')
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.positiveFeedbackButton?.hidden, 'should have shown positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.hidden, 'should have shown negative feedback button')
    assert.isFalse(container.positiveFeedbackButton?.disabled, 'should have enabled positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.disabled, 'should have enabled negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
    assert.equal(
      container.clipboardCopy?.getAttribute('value'),
      'Hello world',
      'should have set text to be copied to text value of summary, not HTML',
    )

    // Submit positive feedback
    container.positiveFeedbackButton?.click()
    await waitUntil(() => feedbackRequestCount === 1, 'expected feedback request to be made')
    assert.isTrue(container.positiveFeedbackButton?.disabled, 'should have disabled positive feedback button')
    assert.isTrue(container.negativeFeedbackButton?.hidden, 'should have hidden negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have kept copy button visible')

    // Simulate update to discussion
    container.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'Discussion:#1', data: {gid: 'foobar'}}}))
    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.equal(container.descriptiveText?.textContent?.trim(), newUpdatesText)
    assert.instanceOf(container.newUpdatesIndicator, HTMLElement)
    assert.isFalse(container.newUpdatesIndicator?.hidden, 'should have shown new updates indicator')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.instanceOf(container.regenerateButton, HTMLButtonElement)
    assert.isFalse(container.regenerateButton?.hidden, 'should have shown regenerate button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have kept copy button visible')

    // Regenerate summary
    container.regenerateButton?.click()
    assert.isTrue(container.clipboardCopy?.hidden, 'should have hidden copy button while regenerating')

    await waitUntil(() => requestCount === 2, 'expected POST request to be made')
    assert.instanceOf(container.descriptiveText, HTMLElement)
    assert.equal(
      container.descriptiveText?.textContent,
      completeText,
      'should have set descriptive text to data-complete-text',
    )
    assert.isTrue(container.newUpdatesIndicator?.hidden, 'should have hidden new updates indicator')
    assert.isTrue(container.regenerateButton?.hidden, 'should have hidden regenerate button')
    assert.isFalse(container.positiveFeedbackButton?.hidden, 'should have shown positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.hidden, 'should have shown negative feedback button')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have kept early access indicator visible')
    assert.isFalse(container.positiveFeedbackButton?.disabled, 'should have enabled positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.disabled, 'should have enabled negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
  })

  test('Shows cached summary initially when it exists', () => {
    // eslint-disable-next-line github/unescaped-html-literal
    const fakeCachedSummary = "<p>You won't believe the quality of this summary, oh boy.</p>"
    summaryCache?.setSummary(fakeCachedSummary)

    assert.isFalse(container.hidden, 'should have shown banner after connecting')
    assert.equal(
      container.descriptiveText?.textContent,
      cacheHitText,
      'should have set descriptive text to data-cache-hit-text',
    )
    assert.isFalse(container.regenerateButton?.hidden, 'should have shown regenerate button')
    assert.isTrue(container.summarizeButton?.hidden, 'should have hidden summarize button')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.isFalse(container.results?.hidden, 'should have shown results')
    assert.isFalse(container.visibilityText?.hidden, 'should have shown visibility text')
    assert.equal(container.results?.innerHTML, fakeCachedSummary, 'should have rendered cached summary HTML')
    assert.isFalse(container.copilotBadge?.hidden, 'should have shown Copilot badge')
    assert.isTrue(container.loadingCopilotBadge?.hidden, 'should have hidden loading Copilot badge')
    assert.isTrue(container.skeletonText?.hidden, 'should have hidden skeleton text')
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.positiveFeedbackButton?.hidden, 'should have shown positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.hidden, 'should have shown negative feedback button')
    assert.isFalse(container.positiveFeedbackButton?.disabled, 'should have enabled positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.disabled, 'should have enabled negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
    assert.equal(
      container.clipboardCopy?.getAttribute('value'),
      "You won't believe the quality of this summary, oh boy.",
      'should have set text to be copied to text value of cached summary, not HTML',
    )
    assert.isFalse(container.summarizationTimeLabel?.hidden, 'should have shown summary generation time')
    assert.notEqual(container.summarizationTimeLabel?.getAttribute('datetime'), '', 'should have set datetime')
    assert.notEqual(container.summarizationTimeLabel?.textContent, '', 'should have set text content for time label')
  })

  test('Shows cached summary and feedback vote initially when they exist', () => {
    // eslint-disable-next-line github/unescaped-html-literal
    const fakeCachedSummary = '<p>This right here is a nice summary.</p>'
    summaryCache?.setSummary(fakeCachedSummary)
    const fakeCachedFeedbackVote = 'positive'
    summaryCache?.setSummaryFeedbackSentiment(fakeCachedFeedbackVote)

    assert.isFalse(container.hidden, 'should have shown banner after connecting')
    assert.equal(
      container.descriptiveText?.textContent,
      cacheHitText,
      'should have set descriptive text to data-cache-hit-text',
    )
    assert.isTrue(container.newUpdatesIndicator?.hidden, 'should have hidden new updates indicator')
    assert.isFalse(container.regenerateButton?.hidden, 'should have shown regenerate button')
    assert.isTrue(container.summarizeButton?.hidden, 'should have hidden summarize button')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.isFalse(container.results?.hidden, 'should have shown results')
    assert.isFalse(container.visibilityText?.hidden, 'should have shown visibility text')
    assert.equal(container.results?.innerHTML, fakeCachedSummary, 'should have rendered cached summary HTML')
    assert.isFalse(container.copilotBadge?.hidden, 'should have shown Copilot badge')
    assert.isTrue(container.loadingCopilotBadge?.hidden, 'should have hidden loading Copilot badge')
    assert.isTrue(container.skeletonText?.hidden, 'should have hidden skeleton text')
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.positiveFeedbackButton?.hidden, 'should have shown positive feedback button')
    assert.isTrue(container.negativeFeedbackButton?.hidden, 'should have hidden negative feedback button')
    assert.isTrue(container.positiveFeedbackButton?.disabled, 'should have disabled positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.disabled, 'should have enabled negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
    assert.equal(
      container.clipboardCopy?.getAttribute('value'),
      'This right here is a nice summary.',
      'should have set text to be copied to text value of cached summary, not HTML',
    )
    assert.isFalse(container.summarizationTimeLabel?.hidden, 'should have shown summary generation time')
    assert.notEqual(container.summarizationTimeLabel?.getAttribute('datetime'), '', 'should have set datetime')
    assert.notEqual(container.summarizationTimeLabel?.textContent, '', 'should have set text content for time label')
  })

  test('Hides summarization time when regenerating summary after initially showing a cached summary', async () => {
    // eslint-disable-next-line github/unescaped-html-literal
    const fakeCachedSummary = '<p>Can you believe it is pumpkin spice season already?</p>'
    summaryCache?.setSummary(fakeCachedSummary)
    const fakeCachedFeedbackVote = 'negative'
    summaryCache?.setSummaryFeedbackSentiment(fakeCachedFeedbackVote)

    let summarizeRequestCount = 0
    // eslint-disable-next-line github/unescaped-html-literal
    const fakeNewSummary = '<p>It will be Halloween soon!</p>'

    worker.use(
      http.post(fakeSummarizeEndpointPath, () => {
        summarizeRequestCount++
        return HttpResponse.text(fakeNewSummary)
      }),
    )

    // Start out with cached summary shown
    assert.isFalse(container.hidden, 'should have shown banner after connecting')
    assert.equal(
      container.descriptiveText?.textContent,
      cacheHitText,
      'should have set descriptive text to data-cache-hit-text',
    )
    assert.isTrue(container.newUpdatesIndicator?.hidden, 'should have hidden new updates indicator')
    assert.isFalse(container.regenerateButton?.hidden, 'should have shown regenerate button')
    assert.isTrue(container.summarizeButton?.hidden, 'should have hidden summarize button')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.isFalse(container.results?.hidden, 'should have shown results')
    assert.isFalse(container.visibilityText?.hidden, 'should have shown visibility text')
    assert.equal(container.results?.innerHTML, fakeCachedSummary, 'should have rendered cached summary HTML')
    assert.isFalse(container.copilotBadge?.hidden, 'should have shown Copilot badge')
    assert.isTrue(container.loadingCopilotBadge?.hidden, 'should have hidden loading Copilot badge')
    assert.isTrue(container.skeletonText?.hidden, 'should have hidden skeleton text')
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isTrue(container.positiveFeedbackButton?.hidden, 'should have hidden positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.hidden, 'should have shown negative feedback button')
    assert.isFalse(container.positiveFeedbackButton?.disabled, 'should have enabled positive feedback button')
    assert.isTrue(container.negativeFeedbackButton?.disabled, 'should have disabled negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
    assert.equal(
      container.clipboardCopy?.getAttribute('value'),
      'Can you believe it is pumpkin spice season already?',
      'should have set text to be copied to text value of cached summary, not HTML',
    )
    assert.isFalse(container.summarizationTimeLabel?.hidden, 'should have shown summary generation time')
    assert.notEqual(container.summarizationTimeLabel?.getAttribute('datetime'), '', 'should have set datetime')
    assert.notEqual(container.summarizationTimeLabel?.textContent, '', 'should have set text content for time label')

    // Regenerate summary
    container.regenerateButton?.click()
    assert.isTrue(container.clipboardCopy?.hidden, 'should have hidden copy button while regenerating')
    await waitUntil(() => summarizeRequestCount === 1, 'expected summarize request to be made')
    assert.equal(
      container.descriptiveText?.textContent,
      completeText,
      'should have set descriptive text to data-complete-text',
    )
    assert.isTrue(container.summarizationTimeLabel?.hidden, 'should have hidden summarization time label')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.isFalse(container.results?.hidden, 'should have shown results')
    assert.isFalse(container.visibilityText?.hidden, 'should have shown visibility text')
    assert.equal(container.results?.innerHTML, fakeNewSummary, 'should have rendered regenerated summary HTML')
    assert.isFalse(container.copilotBadge?.hidden, 'should have shown Copilot badge')
    assert.isTrue(container.loadingCopilotBadge?.hidden, 'should have hidden loading Copilot badge')
    assert.isTrue(container.skeletonText?.hidden, 'should have hidden skeleton text')
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.positiveFeedbackButton?.hidden, 'should have shown positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.hidden, 'should have shown negative feedback button')
    assert.isFalse(container.positiveFeedbackButton?.disabled, 'should have enabled positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.disabled, 'should have enabled negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
    assert.equal(
      container.clipboardCopy?.getAttribute('value'),
      'It will be Halloween soon!',
      'should have set text to be copied to text value of summary, not HTML',
    )
    assert.equal(summaryCache?.getSummary(), fakeNewSummary, 'should have cached summary response')
  })

  test('Shows new update indicator when updates come in when a cached summary is shown', () => {
    // eslint-disable-next-line github/unescaped-html-literal
    const fakeCachedSummary = '<p>I am enjoying this matcha.</p>'
    summaryCache?.setSummary(fakeCachedSummary)

    // Start out with cached summary shown
    assert.isFalse(container.hidden, 'should have shown banner after connecting')
    assert.equal(
      container.descriptiveText?.textContent,
      cacheHitText,
      'should have set descriptive text to data-cache-hit-text',
    )
    assert.isFalse(container.regenerateButton?.hidden, 'should have shown regenerate button')
    assert.isTrue(container.summarizeButton?.hidden, 'should have hidden summarize button')
    assert.isTrue(container.newUpdatesIndicator?.hidden, 'should have hidden new updates indicator')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.isFalse(container.results?.hidden, 'should have shown results')
    assert.isFalse(container.visibilityText?.hidden, 'should have shown visibility text')
    assert.equal(container.results?.innerHTML, fakeCachedSummary, 'should have rendered cached summary HTML')
    assert.isFalse(container.copilotBadge?.hidden, 'should have shown Copilot badge')
    assert.isTrue(container.loadingCopilotBadge?.hidden, 'should have hidden loading Copilot badge')
    assert.isTrue(container.skeletonText?.hidden, 'should have hidden skeleton text')
    assert.isFalse(container.feedback?.hidden, 'should have shown feedback buttons')
    assert.isFalse(container.positiveFeedbackButton?.hidden, 'should have shown positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.hidden, 'should have shown negative feedback button')
    assert.isFalse(container.positiveFeedbackButton?.disabled, 'should have enabled positive feedback button')
    assert.isFalse(container.negativeFeedbackButton?.disabled, 'should have enabled negative feedback button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have shown copy button')
    assert.equal(
      container.clipboardCopy?.getAttribute('value'),
      'I am enjoying this matcha.',
      'should have set text to be copied to text value of cached summary, not HTML',
    )
    assert.isFalse(container.summarizationTimeLabel?.hidden, 'should have shown summary generation time')
    assert.notEqual(container.summarizationTimeLabel?.getAttribute('datetime'), '', 'should have set datetime')
    assert.notEqual(container.summarizationTimeLabel?.textContent, '', 'should have set text content for time label')

    // Simulate update to discussion
    container.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'Discussion:#1', data: {gid: 'foobar'}}}))
    assert.equal(container.descriptiveText?.textContent?.trim(), newUpdatesText)
    assert.isFalse(container.newUpdatesIndicator?.hidden, 'should have shown new updates indicator')
    assert.isFalse(container.earlyAccessLabel?.hidden, 'should have shown early access indicator')
    assert.isFalse(container.regenerateButton?.hidden, 'should have shown regenerate button')
    assert.isFalse(container.clipboardCopy?.hidden, 'should have kept copy button visible')
  })
})
