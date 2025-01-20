import {controller, target} from '@github/catalyst'
import {debounce} from '@github/mini-throttle/decorators'
import {validate} from '../../assets/modules/github/behaviors/html-validation'
import type SeverityScoreElement from './severity-score-element'
import type CvssCalculatorElement from './cvss-calculator-element'

const DEFAULT_VECTOR_STRING = 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N'

// TODO : This should be loaded from an embedded string in the HTML formatted from
// Advisories::CvssCalculatorComponent::METRICS
const validChoices: {[index: string]: {[index: string]: boolean}} = {
  AV: {
    N: true,
    A: true,
    L: true,
    P: true,
  },
  AC: {
    L: true,
    H: true,
  },
  AT: {
    N: true,
    P: true,
  },
  PR: {
    N: true,
    L: true,
    H: true,
  },
  UI: {
    N: true,
    P: true,
    A: true,
  },
  VC: {
    H: true,
    L: true,
    N: true,
  },
  VI: {
    H: true,
    L: true,
    N: true,
  },
  VA: {
    H: true,
    L: true,
    N: true,
  },
  SC: {
    H: true,
    L: true,
    N: true,
  },
  SI: {
    H: true,
    L: true,
    N: true,
  },
  SA: {
    H: true,
    L: true,
    N: true,
  },
}

// FYI: Selection is a misnomer (there is a selection control inside this, do not be confused!)
//  This an editor for all Severity information for an advisory, including a selection for a Severity field and
//  CVSS vector string inputs + calculators. These are all dependent on each other, this controller manages that.
@controller
export default class SeveritySelectionNextElement extends HTMLElement {
  // The expander around the calculator, the selection element collapses and expands it based on other state in selection.
  @target cvssCalculatorExpander: HTMLDetailsElement
  @target cvssCalculator: CvssCalculatorElement

  // A read only final result of all severity edits summarized for the user, sometimes rendering "pending" text.
  // TODO: Is pending really needed? Can we remove the concept and just show 0?
  @target severityScore: SeverityScoreElement

  // A seleciton control which allows the user to select an authoritiative severity value, which overrides other
  // severity inputs. There is a special option in the drop down which allows a user to enter CVSS instead.
  // Overlap with the name of the controller is incidental.
  @target severitySelect: HTMLSelectElement

  // This is the container that is 1-1 with the form data for the CVSS vector string.
  // The actual input is within, vectorStringInput. Error output for this field is in vectorStringError.
  @target vectorStringField: HTMLElement
  @target vectorStringError: HTMLElement
  @target vectorStringInput: HTMLInputElement

  buildCVSS4ErrorMessage(vectorString: string): string {
    if (vectorString === '') {
      return this.vectorStringError.getAttribute('data-empty-cvss-error-message') || ''
    }

    const cvssV4Pattern = /^CVSS:4\.\d+(\/[^:]+:[^:]+){11}$/

    if (!cvssV4Pattern.test(vectorString)) {
      return this.vectorStringError.getAttribute('data-error-message') || ''
    }

    // Further check whether the typed code pairs are valid
    const keyValuePairs: string[] = vectorString.split('/').slice(1)

    for (const keyValuePair of keyValuePairs) {
      const [metricCode, value] = keyValuePair.split(':')

      if (!validChoices[metricCode!]) {
        const errorText = this.vectorStringError.getAttribute('data-invalid-metric-error-message') || ''
        return errorText.replace('{}', metricCode!)
      }

      if (!validChoices[metricCode!]![value!]) {
        const errorText = this.vectorStringError.getAttribute('data-invalid-metric-value-error-message') || ''
        return errorText.replace('{}', value!).replace('{}', metricCode!)
      }
    }

    return ''
  }

  connectedCallback() {
    // When you press the browser back button after submitting an advisory with
    // a vector string option, it renders the CVSS calculator collapsed.
    // We need to bring it up, but to check that case, the unselected select is
    // not populated with the CVSS option until this method is over, so to make
    // things work we have to delay the check for the selected value.
    setTimeout(() => {
      if (this.severitySelect.value === 'cvss') {
        this.showSeverityCalculator()
      } else if (this.severitySelect.value) {
        // Initialize simple severity label and score range on load
        this.severityScore.severity = this.severitySelect.value
      }
    }, 0)

    this.handleVectorStringInput()
  }

  setDefaultVectorString() {
    const previousVectorStringValue = this.vectorStringInput.getAttribute('data-previous-value')

    if (this.cvssCalculatorExpander.hasAttribute('open')) {
      if (!previousVectorStringValue && this.vectorStringInput.value === '') {
        this.vectorStringInput.value = DEFAULT_VECTOR_STRING
        this.vectorStringInput.setAttribute('data-previous-value', this.vectorStringInput.value)
      }

      this.toggleSeverityCalculator('cvss')
    } else {
      if (this.severitySelect.value !== '' && this.severitySelect.value !== 'cvss') {
        return
      } else {
        this.severitySelect.value = ''
        this.toggleSeverityCalculator('')
      }
    }
  }

  toggleSeverityCalculator(value: string) {
    if (value === 'cvss') {
      if (this.vectorStringInput.hasAttribute('data-previous-value')) {
        this.vectorStringInput.value = this.vectorStringInput.getAttribute('data-previous-value')!

        // TODO : Is it necessary to call both of these here?
        // See comments beginning here: https://github.com/github/github/pull/335178#discussion_r1714388363
        this.handleVectorStringInput()
        this.handleVectorStringBlur()
      } else {
        this.severityScore.setPending()
      }

      this.showSeverityCalculator()
    } else {
      if (this.vectorStringInput.value !== '') {
        this.vectorStringInput.setAttribute('data-previous-value', this.vectorStringInput.value)

        this.vectorStringInput.value = ''
      }

      if (value === '') {
        this.severityScore.setPending()
      } else {
        this.severityScore.severity = value
      }
      this.hideSeverityCalculator()
    }
  }

  // Used when the CVSS calculator is modified using the user interface controls
  async handleCalculatorSelectionChanged(customEvent: CustomEvent<{userInitiated: boolean}>) {
    if (customEvent.detail.userInitiated) {
      this.selectSeverityCvss()
      this.vectorStringInput.removeAttribute('data-previous-value')
      this.regenerateVectorString()
      this.hideFormGroupError(this.vectorStringField)

      // Only compute the score if all of the controls have been selected
      if (this.isValidCVSS4(this.vectorStringInput.value)) {
        this.vectorStringInput.setCustomValidity('')

        await this.severityScore.calculateScore(this.vectorStringInput.value)
      } else {
        this.vectorStringInput.setCustomValidity(this.vectorStringErrorMessage)
        this.severityScore.setPending()
      }

      validate(this.vectorStringInput.form!)
    }
  }

  handleSeveritySelectChange(event: Event) {
    const {value} = event.target as HTMLSelectElement

    this.toggleSeverityCalculator(value)
  }

  // TODO : Rename this method to follow Catalyst conventions and reflect
  // intent instead of reading like an event handler.
  // See the comments starting here: https://github.com/github/github/pull/335178#discussion_r1714366344
  async handleVectorStringBlur() {
    // Don't update the score if a severity was already manually selected and no vector string input was given
    if (this.severitySelect.value !== 'cvss' && this.vectorStringInput.value === '') return

    this.selectSeverityCvss()
    this.vectorStringInput.removeAttribute('data-previous-value')

    if (this.validateVectorStringInput()) {
      await this.severityScore.calculateScore(this.vectorStringInput.value)
    } else {
      this.severityScore.setPending()
    }
  }

  // TODO : Rename this method to follow Catalyst conventions and reflect
  // intent instead of reading like an event handler.
  // See the comments starting here: https://github.com/github/github/pull/335178#discussion_r1714366344
  @debounce(100)
  handleVectorStringInput() {
    const newVectorString: string = this.vectorStringInput.value
    this.cvssCalculator.vectorString = newVectorString
  }

  hideFormGroupError(formGroup: HTMLElement) {
    if (formGroup.classList.contains('errored')) {
      formGroup.classList.remove('errored')
    }
  }

  hideSeverityCalculator() {
    this.cvssCalculatorExpander.removeAttribute('open')

    this.vectorStringInput.required = false

    this.hideFormGroupError(this.vectorStringField)
    this.vectorStringInput.setCustomValidity('')

    validate(this.vectorStringInput.form!)
  }

  isValidCVSS4(vectorString: string): boolean {
    return this.buildCVSS4ErrorMessage(vectorString) === ''
  }

  regenerateVectorString() {
    this.vectorStringInput.value = this.cvssCalculator.vectorString
  }

  resetSeveritySelectElement() {
    for (let optionIndex = 0; optionIndex < this.severitySelect.options.length; optionIndex++) {
      const severitySelectOption = this.severitySelect.options[optionIndex]!

      if (severitySelectOption.defaultSelected) {
        this.severitySelect.selectedIndex = optionIndex

        break
      }
    }
  }

  selectSeverityCvss() {
    if (this.severitySelect.value !== 'cvss') {
      this.severitySelect.value = 'cvss'
    }
  }

  showFormGroupError(formGroup: HTMLElement) {
    if (!formGroup.classList.contains('errored')) {
      formGroup.classList.add('errored')
    }
  }

  showSeverityCalculator() {
    this.cvssCalculatorExpander.setAttribute('open', '')

    this.vectorStringInput.required = true

    if (this.vectorStringInput.value !== '') {
      this.validateVectorStringInput()
    }
  }

  // Returns true if a vector string is typed and it is valid
  validateVectorStringInput(): boolean {
    const error: string = this.buildCVSS4ErrorMessage(this.vectorStringInput.value)

    if (!error) {
      this.hideFormGroupError(this.vectorStringField)
      this.vectorStringInput.setCustomValidity('')
    } else {
      this.vectorStringError.textContent = error

      this.showFormGroupError(this.vectorStringField)
      this.vectorStringInput.setCustomValidity(this.vectorStringErrorMessage)
    }

    validate(this.vectorStringInput.form!)

    return !error
  }

  get vectorStringErrorMessage() {
    return (
      this.vectorStringError.getAttribute('data-error-message') ||
      // eslint-disable-next-line i18n-text/no-en
      'Please fill out this field with a valid vector string'
    )
  }
}
