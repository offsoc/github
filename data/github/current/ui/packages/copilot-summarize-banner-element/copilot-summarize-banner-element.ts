import {controller, target} from '@github/catalyst'
import {verifiedFetch, verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {GenerateCopilotSummaryEvent} from './events'
import SummaryCache from './summary-cache'
import type {SummaryFeedbackSentiment} from './types'
import type {RelativeTimeElement} from '@github/relative-time-element'

@controller
export class CopilotSummarizeBannerElement extends HTMLElement {
  @target results: HTMLElement | undefined
  @target skeletonText: HTMLElement | undefined
  @target summarizeButton: HTMLButtonElement | undefined
  @target visibilityText: HTMLElement | undefined
  @target copilotBadge: HTMLElement | undefined
  @target loadingCopilotBadge: HTMLElement | undefined
  @target errorCopilotBadge: HTMLElement | undefined
  @target descriptiveText: HTMLElement | undefined
  @target clipboardCopy: HTMLElement | undefined
  @target feedback: HTMLElement | undefined
  @target newUpdatesIndicator: HTMLElement | undefined
  @target regenerateButton: HTMLButtonElement | undefined
  @target positiveFeedbackButton: HTMLButtonElement | undefined
  @target negativeFeedbackButton: HTMLButtonElement | undefined
  @target negativeFeedbackDialog: HTMLDialogElement | undefined
  @target negativeFeedbackForm: HTMLFormElement | undefined
  @target earlyAccessLabel: HTMLElement | undefined
  @target summarizationTimeLabel: RelativeTimeElement | undefined

  summaryGenerated = false
  prompt: string | null = null
  summaryPath: string | null | undefined
  cache: SummaryCache | undefined

  socketEventHandler = (event: Event) => this.#renderNewUpdatesState(event)
  generateSummaryHandler = (event: GenerateCopilotSummaryEvent) => this.#setOptionsAndSummarize(event)
  negativeFeedbackSubmitHandler = (event: SubmitEvent) => this.#submitNegativeFeedback(event)

  connectedCallback() {
    this.addEventListener('socket:message', this.socketEventHandler)
    window.addEventListener('generate-copilot-summary', this.generateSummaryHandler)
    if (this.negativeFeedbackForm) {
      this.negativeFeedbackForm.addEventListener('submit', this.negativeFeedbackSubmitHandler)
    }
    this.summaryPath = this.summarizeButton?.getAttribute('data-path')
    if (this.summaryPath) {
      this.cache = new SummaryCache({contentIdentifier: this.summaryPath})
    }
    this.#restoreCachedSummary()
    this.#showElement(this)
  }

  disconnectedCallback() {
    window.removeEventListener('generate-copilot-summary', this.generateSummaryHandler)
    if (this.negativeFeedbackForm) {
      this.negativeFeedbackForm.removeEventListener('submit', this.negativeFeedbackSubmitHandler)
    }
    this.removeEventListener('socket:message', this.socketEventHandler)
  }

  async submitPositiveFeedback(event: Event) {
    const button = event.currentTarget as HTMLButtonElement
    const feedbackPath = button.getAttribute('data-path')
    if (typeof feedbackPath !== 'string') return

    const body = {feedback_choices: ['POSITIVE']}
    await verifiedFetchJSON(feedbackPath, {method: 'POST', body})
    this.#afterFeedbackSubmitted('positive')
  }

  #restoreCachedSummary() {
    if (!this.cache) return

    const summary = this.cache.getSummary()
    if (!summary) return

    this.summaryGenerated = true
    this.#renderSummaryCompleteState(summary)
    const sentiment = this.cache.getSummaryFeedbackSentiment()
    this.#toggleFeedbackButtonsBasedOnSentiment(sentiment)
    this.#showElement(this.regenerateButton)

    const summaryTime = this.cache.getSummaryTime()
    this.#updateRelativeTimeElement(this.summarizationTimeLabel, summaryTime)
    if (summaryTime) {
      this.#setTextContent(this.descriptiveText, 'data-cache-hit-text')
      this.#showElement(this.summarizationTimeLabel)
    } else {
      this.#hideElement(this.summarizationTimeLabel)
    }
  }

  #toggleFeedbackButtonsBasedOnSentiment(sentiment: SummaryFeedbackSentiment | null) {
    if (!sentiment) return

    if (sentiment === 'positive') {
      this.#hideElement(this.negativeFeedbackButton)
      this.#disableButton(this.positiveFeedbackButton)
    } else {
      this.#hideElement(this.positiveFeedbackButton)
      this.#disableButton(this.negativeFeedbackButton)
    }
  }

  async #submitNegativeFeedback(event: SubmitEvent) {
    event.preventDefault() // don't actually submit the form
    const path = this.negativeFeedbackForm?.action
    if (!path) return

    const body = new FormData(this.negativeFeedbackForm)
    await verifiedFetch(path, {method: 'POST', body})
    this.#afterFeedbackSubmitted('negative')
  }

  #setOptionsAndSummarize(event: GenerateCopilotSummaryEvent) {
    this.prompt = event.payload.prompt
    this.#beginSummarization()
  }

  summarize(_event: Event) {
    this.#beginSummarization()
  }

  async #beginSummarization() {
    this.#hideNewUpdatesState()
    this.#renderLoadingState()

    try {
      const summary = await this.#makeSummarizeRequest()

      if (summary) {
        this.#renderSummaryCompleteState(summary)
        this.summaryGenerated = true
        this.cache?.setSummary(summary)
      } else {
        this.#renderErrorState()
      }
    } catch {
      this.#renderErrorState()
    }
  }

  async #makeSummarizeRequest() {
    if (typeof this.summaryPath !== 'string') return

    const formData = new FormData()
    if (this.prompt) {
      formData.append('prompt', this.prompt)
    }
    const response = await verifiedFetch(this.summaryPath, {
      method: 'POST',
      headers: {Accept: 'text/html'},
      body: formData,
    })
    return response.text()
  }

  #renderNewUpdatesState(event: Event) {
    if (!this.summaryGenerated) return

    const aliveData = (event as CustomEvent)?.detail
    if (!aliveData) return

    this.#showElement(this.newUpdatesIndicator)
    this.#showElement(this.regenerateButton)
    this.#setTextContent(this.descriptiveText, 'data-new-updates-text')
  }

  #hideNewUpdatesState() {
    this.#hideElement(this.newUpdatesIndicator)
    this.#hideElement(this.regenerateButton)
  }

  #renderLoadingState() {
    this.#hideElement(this.summarizeButton)
    this.#changeBadgeToLoadingState()
    this.#setTextContent(this.descriptiveText, 'data-loading-text')
    this.#setInnerHtml(this.results, '')
    this.#showElement(this.skeletonText)
    this.#hideElement(this.results)
    this.#resetFeedback()
    this.#hideElement(this.earlyAccessLabel)
    this.#hideElement(this.clipboardCopy)
    this.#setValue(this.clipboardCopy, '')
    this.#hideElement(this.summarizationTimeLabel)
  }

  #renderErrorState() {
    this.#changeBadgeToErrorState()
    this.#hideElement(this.skeletonText)
    this.#setTextContent(this.descriptiveText, 'data-error-text')
    this.#showTryAgainButton()
    this.#resetFeedback()
    this.#hideElement(this.earlyAccessLabel)
    this.#hideElement(this.clipboardCopy)
    this.#setValue(this.clipboardCopy, '')
  }

  #renderSummaryCompleteState(summary: string) {
    this.#hideElement(this.summarizeButton)
    this.#showElement(this.visibilityText)
    this.#setInnerHtml(this.results, summary)
    this.#showElement(this.results)
    this.#hideElement(this.skeletonText)
    this.#changeBadgeToDefaultState()
    this.#setTextContent(this.descriptiveText, 'data-complete-text')
    this.#setValue(this.clipboardCopy, this.results?.textContent ?? '')
    this.#showElement(this.clipboardCopy)
    if (!this.prompt) {
      this.#showElement(this.feedback)
    }
    this.#showElement(this.earlyAccessLabel)
  }

  #showTryAgainButton() {
    this.#setTextContent(this.summarizeButton, 'data-retry-text')
    this.#showElement(this.summarizeButton)
  }

  #afterFeedbackSubmitted(sentiment: SummaryFeedbackSentiment) {
    this.negativeFeedbackDialog?.close()
    this.#toggleFeedbackButtonsBasedOnSentiment(sentiment)
    this.cache?.setSummaryFeedbackSentiment(sentiment)
  }

  #resetFeedback() {
    this.#hideElement(this.feedback)
    this.#showElement(this.positiveFeedbackButton)
    this.#showElement(this.negativeFeedbackButton)
    this.#enableButton(this.positiveFeedbackButton)
    this.#enableButton(this.negativeFeedbackButton)
    this.negativeFeedbackDialog?.close()
  }

  #changeBadgeToLoadingState() {
    this.#hideElement(this.copilotBadge)
    this.#showElement(this.loadingCopilotBadge)
    this.#hideElement(this.errorCopilotBadge)
  }

  #changeBadgeToErrorState() {
    this.#hideElement(this.copilotBadge)
    this.#hideElement(this.loadingCopilotBadge)
    this.#showElement(this.errorCopilotBadge)
  }

  #changeBadgeToDefaultState() {
    this.#hideElement(this.loadingCopilotBadge)
    this.#showElement(this.copilotBadge)
    this.#hideElement(this.errorCopilotBadge)
  }

  #setInnerHtml(element: HTMLElement | undefined, content: string) {
    if (element) element.innerHTML = content
  }

  #setTextContent(element: HTMLElement | undefined, attributeName: string) {
    if (element) {
      const content = element.getAttribute(attributeName)
      element.textContent = content
    }
  }

  #setValue(element: HTMLElement | undefined, value: string) {
    if (element) element.setAttribute('value', value)
  }

  #showElement(element: HTMLElement | undefined) {
    if (element) element.hidden = false
  }

  #hideElement(element: HTMLElement | undefined) {
    if (element) element.hidden = true
  }

  #disableButton(button: HTMLButtonElement | undefined) {
    if (button) button.disabled = true
  }

  #enableButton(button: HTMLButtonElement | undefined) {
    if (button) button.disabled = false
  }

  #updateRelativeTimeElement(element: RelativeTimeElement | undefined, date: Date | null) {
    if (!element) return
    date = date ?? new Date()
    element.datetime = date.toISOString()
    element.textContent = date.toLocaleString()
  }
}
