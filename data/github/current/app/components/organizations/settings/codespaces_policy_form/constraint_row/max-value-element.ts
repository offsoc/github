import {controller, target} from '@github/catalyst'
import {debounce} from '@github/mini-throttle/decorators'

function hideElement(element: HTMLElement | null): void {
  if (element !== null) {
    element.hidden = true
  }
}

function showElement(element: HTMLElement | null): void {
  if (element !== null) {
    element.hidden = false
  }
}

@controller
class MaxValueElement extends HTMLElement {
  @target maxValueDisplay: HTMLSpanElement
  @target maxValueInput: HTMLInputElement
  @target maxValueInputUnit: HTMLSpanElement
  @target maxValueInputFormGroup: HTMLDivElement
  @target maxValueSaveButton: HTMLButtonElement
  @target maxValueValidationErrorMsg: HTMLDivElement
  @target editDetailsDropdown: HTMLDetailsElement

  enforceMaxValueLength(event: Event): void {
    const currentTarget = event.currentTarget as HTMLInputElement
    if (currentTarget.value.length > currentTarget.maxLength) {
      currentTarget.value = currentTarget.value.slice(0, currentTarget.maxLength)
    }
  }

  toggleMaxValueSaveButton(event: Event): void {
    const input = event.target as HTMLInputElement
    const value = parseInt(input.value)
    const isInvalid = value > parseInt(input.max) || value < parseInt(input.min)

    this.maxValueSaveButton.disabled = isInvalid
  }

  closeDetailsDropdown(event: Event): void {
    const button = event.target as HTMLElement

    const dropdown = button.closest('.dropdown')
    if (dropdown) {
      dropdown.removeAttribute('open')
    }
  }

  @debounce(400)
  handleMaximumValueConstraintChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const newMaximumValue = parseInt(input.value)
    this.validateMaxMinValueLength(newMaximumValue, input)
  }

  validateMaxMinValueLength(value: number, input: HTMLInputElement): void {
    if (value > parseInt(input.max) || value < parseInt(input.min)) {
      this.toggleMaxValueError({showError: true})
      return
    }

    this.toggleMaxValueError({showError: false})
  }

  toggleMaxValueError({showError}: {showError: boolean}): void {
    if (showError) {
      this.maxValueInputFormGroup.classList.add('errored')
      showElement(this.maxValueValidationErrorMsg)
      return
    }

    this.maxValueInputFormGroup.classList.remove('errored')
    hideElement(this.maxValueValidationErrorMsg)
  }

  updateDisplayText(): void {
    const newMaxValue = parseInt(this.maxValueInput.value)
    const singularSuffix = this.maxValueDisplay.getAttribute('data-singular-suffix')
    const pluralSuffix = this.maxValueDisplay.getAttribute('data-plural-suffix')

    if (newMaxValue === 1) {
      this.maxValueDisplay.textContent = `1 ${singularSuffix}`
      this.maxValueInputUnit.textContent = singularSuffix
    } else {
      this.maxValueDisplay.textContent = `${newMaxValue} ${pluralSuffix}`
      this.maxValueInputUnit.textContent = pluralSuffix
    }
  }

  saveMaximumValueConstraintChange(): void {
    const {value} = this.maxValueInput
    const constraintName = this.maxValueInput.getAttribute('data-constraint-name')
    this.dispatchEvent(new CustomEvent('commit', {detail: {value, constraintName}}))
  }
}
