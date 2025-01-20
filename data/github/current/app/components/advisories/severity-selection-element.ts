import {controller, target} from '@github/catalyst'
import {debounce} from '@github/mini-throttle/decorators'
import {validate} from '../../assets/modules/github/behaviors/html-validation'
import type SeverityCalculatorElement from './severity-calculator-element'
import type SeverityScoreElement from './severity-score-element'

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
  PR: {
    N: true,
    L: true,
    H: true,
  },
  UI: {
    N: true,
    R: true,
  },
  S: {
    U: true,
    C: true,
  },
  C: {
    N: true,
    L: true,
    H: true,
  },
  I: {
    N: true,
    L: true,
    H: true,
  },
  A: {
    N: true,
    L: true,
    H: true,
  },
}

@controller
export default class SeveritySelectionElement extends HTMLElement {
  @target severityCalculatorElement: SeverityCalculatorElement
  @target severityScoreElement: SeverityScoreElement
  @target severitySelectElement: HTMLSelectElement
  @target vectorStringError: HTMLElement
  @target vectorStringFieldElement: HTMLElement
  @target vectorStringInput: HTMLInputElement

  buildCVSS3ErrorMessage(vectorString: string): string {
    if (vectorString === '') {
      return this.vectorStringError.getAttribute('data-empty-cvss-error-message') || ''
    }

    const cvssV3Pattern = /^CVSS:3\.\d+(\/[^:]+:[^:]+){8}$/

    if (!cvssV3Pattern.test(vectorString)) {
      return this.vectorStringError.getAttribute('data-error-message') || ''
    }

    // further check whether the typed code pairs are valid
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
    // a vector string option, it renders the cvss calculator collapsed.
    // We need to bring it up, but to check that case, the unselected select is
    // not populated with  the cvss option until this method is over, so to make
    // things work we have to delay the check for the selected value.
    setTimeout(() => {
      if (this.severitySelectElement.value === 'cvss') {
        this.showSeverityCalculator()
      } else if (this.severitySelectElement.value) {
        // initialize simple severity label and score range on load
        this.severityScoreElement.severity = this.severitySelectElement.value
      }
    }, 0)

    this.handleVectorStringInput()
  }

  toggleSeverityCalculator(value: string) {
    if (value === 'cvss') {
      if (this.vectorStringInput.hasAttribute('data-previous-value')) {
        this.vectorStringInput.value = this.vectorStringInput.getAttribute('data-previous-value')!

        this.handleVectorStringInput()
        this.handleVectorStringBlur()
      } else {
        this.severityScoreElement.setPending()
      }

      this.showSeverityCalculator()
    } else {
      if (this.vectorStringInput.value !== '') {
        this.vectorStringInput.setAttribute('data-previous-value', this.vectorStringInput.value)
        this.vectorStringInput.value = ''
      }

      if (value === '') {
        this.severityScoreElement.setPending()
      } else {
        this.severityScoreElement.severity = value
      }
      this.hideSeverityCalculator()
      this.severityCalculatorElement.deselectAll()
    }
  }

  // Used when the vector string is modified using the user interface controls.
  async handleMetricSelectionChange() {
    this.selectSeverityCvss()
    this.vectorStringInput.removeAttribute('data-previous-value')

    this.regenerateVectorString()
    this.hideFormGroupError(this.vectorStringFieldElement)

    // only compute the score if all the controls have been selected
    if (this.isValidCVSS3(this.vectorStringInput.value)) {
      this.vectorStringInput.setCustomValidity('')
      await this.severityScoreElement.calculateScore(this.vectorStringInput.value)
    } else {
      this.vectorStringInput.setCustomValidity(this.vectorStringErrorMessage)
      this.severityScoreElement.setPending()
    }

    validate(this.vectorStringInput.form!)
  }

  handleSeveritySelectChange(event: Event) {
    const {value} = event.target as HTMLSelectElement
    this.toggleSeverityCalculator(value)
  }

  async handleVectorStringBlur() {
    // Don't update the score if a severity was already manually selected, and no vector string input was given
    if (this.severitySelectElement.value !== 'cvss' && this.vectorStringInput.value === '') return

    this.selectSeverityCvss()
    this.vectorStringInput.removeAttribute('data-previous-value')

    if (this.validateVectorStringInput()) {
      await this.severityScoreElement.calculateScore(this.vectorStringInput.value)
    } else {
      this.severityScoreElement.setPending()
    }
  }

  @debounce(100)
  handleVectorStringInput() {
    const newVectorString: string = this.vectorStringInput.value

    const keyValuePairs: string[] = newVectorString.split('/').slice(1)
    const metricSelections: {[index: string]: string} = keyValuePairs.reduce((selectionHash, keyValuePair) => {
      const [metricCode, value] = keyValuePair.split(':')

      return {
        ...selectionHash,
        [metricCode!]: value,
      }
    }, {})

    for (const metricSelectionElement of this.severityCalculatorElement.metricSelectionElements) {
      const metricCode: string = metricSelectionElement.metricCode!
      const selectionCode = metricSelections[metricCode]!
      metricSelectionElement.selectFromCode(selectionCode)
    }
  }

  hideFormGroupError(formGroup: HTMLElement) {
    if (formGroup.classList.contains('errored')) {
      formGroup.classList.remove('errored')
    }
  }

  hideSeverityCalculator() {
    this.severityCalculatorElement.collapse()
    this.vectorStringInput.required = false

    this.hideFormGroupError(this.vectorStringFieldElement)
    this.vectorStringInput.setCustomValidity('')
    validate(this.vectorStringInput.form!)
  }

  isValidCVSS3(vectorString: string): boolean {
    return this.buildCVSS3ErrorMessage(vectorString) === ''
  }

  regenerateVectorString() {
    let vectorString = 'CVSS:3.1'

    for (const metricSelectionElement of this.severityCalculatorElement.metricSelectionElements) {
      const metricCode = metricSelectionElement.metricCode
      const selectedValue = metricSelectionElement.selectedValue || '_'

      vectorString += `/${metricCode}:${selectedValue}`
    }

    this.vectorStringInput.value = vectorString
  }

  resetSeveritySelectElement() {
    for (let optionIndex = 0; optionIndex < this.severitySelectElement.options.length; optionIndex++) {
      const severitySelectOption = this.severitySelectElement.options[optionIndex]!
      if (severitySelectOption.defaultSelected) {
        this.severitySelectElement.selectedIndex = optionIndex
        break
      }
    }
  }

  selectSeverityCvss() {
    if (this.severitySelectElement.value !== 'cvss') {
      this.severitySelectElement.value = 'cvss'
    }
  }

  showFormGroupError(formGroup: HTMLElement) {
    if (!formGroup.classList.contains('errored')) {
      formGroup.classList.add('errored')
    }
  }

  showSeverityCalculator() {
    this.severityCalculatorElement.expand()
    this.vectorStringInput.required = true

    if (this.vectorStringInput.value !== '') {
      this.validateVectorStringInput()
    }
  }

  // Returns true if a vector string was typed and it was valid.
  validateVectorStringInput(): boolean {
    const error: string = this.buildCVSS3ErrorMessage(this.vectorStringInput.value)

    if (!error) {
      this.hideFormGroupError(this.vectorStringFieldElement)
      this.vectorStringInput.setCustomValidity('')
    } else {
      this.vectorStringError.textContent = error
      this.showFormGroupError(this.vectorStringFieldElement)
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
