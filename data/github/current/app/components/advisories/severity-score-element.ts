import {controller, target} from '@github/catalyst'

interface ScoreData {
  score: number
  severity: string
}

const severityClassNames: {[index: string]: string} = {
  critical: 'Label--danger',
  high: 'Label--orange',
  moderate: 'Label--warning',
  low: 'Label--primary',
}

// Based on the severity ranges in the `cvss_v3_severity` and `cvss_v4_severity` methods in https://github.com/github/advisory-db/lib/severity_calculator.rb
const severityRanges: {[index: string]: string} = {
  low: '0.1 - 3.9',
  moderate: '4.0 - 6.9',
  high: '7.0 - 8.9',
  critical: '9.0 - 10.0',
}

@controller
export default class SeverityScoreElement extends HTMLElement {
  @target scoreFieldElement: HTMLElement
  @target scoreAuthenticityTokenInput: HTMLInputElement
  @target scoreElement: HTMLElement
  @target severityLabelElement: HTMLElement

  readonly pendingScoreTextColorClass = 'color-fg-muted'

  async calculateScore(vectorString: string) {
    this.hideFormGroupError(this.scoreFieldElement)
    this.scoreElement.classList.remove(this.pendingScoreTextColorClass)

    let scoreData: ScoreData

    try {
      scoreData = await this.fetchScoreData(vectorString)
    } catch (error) {
      this.showFormGroupError(this.scoreFieldElement)
      return
    }

    this.score = scoreData.score.toFixed(1)

    const severityLabel = scoreData.severity.toLowerCase()

    this.showSeverityLabel(severityLabel)
  }

  async fetchScoreData(vectorString: string): Promise<ScoreData> {
    const formData = new FormData()

    if (vectorString.startsWith('CVSS:4.0/')) {
      formData.append('cvss_v4', vectorString)
    } else {
      formData.append('cvss_v3', vectorString)
    }

    const url = this.scoreElement.getAttribute('data-action-url')

    if (!url) {
      throw new Error('The endpoint url to get the score must be specified')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Scoped-CSRF-Token': this.scoreAuthenticityTokenInput.value,
      },
      body: formData,
    })
    if (!response.ok) {
      return Promise.reject(new Error('Score could not be calculated'))
    }

    return response.json()
  }

  hideFormGroupError(formGroup: HTMLElement) {
    if (formGroup.classList.contains('errored')) {
      formGroup.classList.remove('errored')
    }
  }

  hideSeverityLabel() {
    this.severityLabelElement.hidden = true
  }

  get pending() {
    return (
      this.severityLabelElement.textContent?.toLowerCase() === 'unknown' &&
      this.score === this.scoreElement.getAttribute('data-empty-message') &&
      this.scoreElement.classList.contains(this.pendingScoreTextColorClass)
    )
  }

  get score() {
    return this.scoreElement.textContent
  }

  set score(newScore) {
    this.scoreElement.textContent = newScore
  }

  set severity(newSeverity: string) {
    this.showSeverityLabel(newSeverity)

    this.score = severityRanges[newSeverity] || ''
  }

  set severityLabel(newSeverityLabel: string) {
    this.severityLabelElement.textContent = newSeverityLabel.charAt(0).toUpperCase() + newSeverityLabel.slice(1)
  }

  // TODO: Is pending really needed? Can we remove the concept and just show 0?
  setPending() {
    this.showSeverityLabel('unknown')

    this.score = this.scoreElement.getAttribute('data-empty-message')

    this.scoreElement.classList.add(this.pendingScoreTextColorClass)
  }

  showFormGroupError(formGroup: HTMLElement) {
    if (!formGroup.classList.contains('errored')) {
      formGroup.classList.add('errored')
    }
  }

  showSeverityLabel(severityLabel: string) {
    this.severityLabel = severityLabel

    // Update the label style
    this.severityLabelElement.classList.remove(...Object.values(severityClassNames))

    const className = severityClassNames[severityLabel]

    if (className && !this.severityLabelElement.classList.contains(className)) {
      this.severityLabelElement.classList.add(className)
    }
  }
}
