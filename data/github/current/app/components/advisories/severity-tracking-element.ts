import {controller} from '@github/catalyst'
import {sendEvent} from '@github-ui/hydro-analytics'

const SEVERITY_SELECT_ACTION = 'selector'
const CVSS_CALCULATOR_ACTION = 'calculator'
const CVSS_STRING_ACTION = 'cvss_string'

@controller
export default class SeverityTrackingElement extends HTMLElement {
  submittedWith: string
  hasUsedCVSSString = false
  hasUsedCVSSCalculator = false
  hasUsedSeveritySelector = false

  addSeveritySelectInteraction(event: Event): void {
    const selectElement = event.target as HTMLSelectElement
    // User didn't choose a severity if they selected "assess using CVSS" or no selection was made
    if (selectElement.value !== 'cvss' && selectElement.value !== '') {
      this.hasUsedSeveritySelector = true
      this.submittedWith = SEVERITY_SELECT_ACTION
    }
  }

  addCVSSStringInteraction(): void {
    this.hasUsedCVSSString = true
    this.submittedWith = CVSS_STRING_ACTION
  }

  addCVSSCalculatorInteraction(): void {
    this.hasUsedCVSSCalculator = true
    this.submittedWith = CVSS_CALCULATOR_ACTION
  }

  reportUserInteraction(): void {
    sendEvent('advisory_severity_selection', {
      submittedSeverityWith: this.submittedWith,
      hasUsedCVSSString: this.hasUsedCVSSString,
      hasUsedCVSSCalculator: this.hasUsedCVSSCalculator,
      hasUsedSeveritySelector: this.hasUsedSeveritySelector,
    })
  }
}
