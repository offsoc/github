import {controller, target} from '@github/catalyst'

// TODO: Move this logic into a shared component
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

// From https://stackoverflow.com/questions/39671641/regex-to-parse-docker-tag
const DOCKER_IMAGE_REGEX = new RegExp(
  '^(?:(?=[^:/]{1,253})(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(?:.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))*(?::[0-9]{1,5})?/)?((?![._-])(?:[a-z0-9._-]*)(?<![._-])(?:/(?![._-])[a-z0-9._-]*(?<![._-]))*)(?::(?![.-])[a-zA-Z0-9_.-]{1,128})?$',
)

@controller
class AllowedValuesInputElement extends HTMLElement {
  @target allowedValuesFormGroup: HTMLDivElement
  @target allowedValuesInput: HTMLTextAreaElement
  @target selectedAllowedValuesText: HTMLSpanElement
  @target allowedValuesList: HTMLDivElement
  @target allowedValueTemplate: HTMLDivElement
  @target allowedValuesValidationErrorMsg: HTMLDivElement
  @target deleteButton: HTMLButtonElement

  allowedValues: {[key: string]: 1} = {}
  connectedCallback(): void {
    const values = JSON.parse(this.allowedValuesFormGroup.getAttribute('data-value') as string) || []
    values.map((value: string) => {
      this.allowedValues = {[value]: 1, ...this.allowedValues}
    })
  }

  errorMessage = 'Value must be between 0 and 100 characters.'

  updateDisplayText(): void {
    const inputValue = Object.keys(this.allowedValues).join(', ')
    if (inputValue.length > 0 && inputValue.length < 100) {
      this.selectedAllowedValuesText.textContent = inputValue
    } else if (inputValue.length > 0 && inputValue.length > 100) {
      this.selectedAllowedValuesText.textContent = `${inputValue.slice(0, 100)}...`
    } else {
      this.selectedAllowedValuesText.textContent = 'None'
    }
  }

  saveAllowedValuesConstraintChange(): void {
    const values = Object.keys(this.allowedValues)
    const constraintName = this.allowedValuesInput.getAttribute('data-constraint-name')
    this.dispatchEvent(new CustomEvent('commit', {detail: {values, constraintName}}))
  }

  addAllowedValue(): void {
    const {value} = this.allowedValuesInput
    // allow for users to put in a comma separated list of values
    const inputtedValues = value.replace(/\s/g, '').split(',')
    const invalidValues = [] as string[]
    inputtedValues.flatMap(inputtedValue => {
      if (!this.isValid(inputtedValue)) {
        invalidValues.push(inputtedValue)
        return []
      }

      if (this.allowedValues[inputtedValue]) {
        return []
      }
      //update state object of allowedValues
      this.allowedValues = {[inputtedValue]: 1, ...this.allowedValues}

      //save the allowed value to the state
      this.saveAllowedValuesConstraintChange()
      //copy template element
      const div = this.allowedValueTemplate.cloneNode(true) as HTMLDivElement
      div.setAttribute('data-target', 'allowed-values-input.allowedValue')
      const deleteButton = div.querySelector('button') as HTMLButtonElement
      //register delete button event listener
      deleteButton.addEventListener('click', () => {
        this.removeAllowedValueAndDiv(inputtedValue, div)
      })
      //update text content of new element
      const paragraph = div.querySelector('p') as HTMLParagraphElement
      paragraph.textContent = inputtedValue
      //append new element to allowedValuesList
      div.hidden = false
      this.allowedValuesList.appendChild(div)
    })

    //clear input
    this.allowedValuesInput.value = ''

    if (invalidValues.length > 0) {
      this.allowedValuesInput.value = invalidValues.join(', ')
      this.toggleMaxValueError({showError: true})
    } else {
      this.toggleMaxValueError({showError: false})
    }

    //update display text
    this.updateDisplayText()
  }

  isValid(value: string): boolean {
    const constraintName = this.allowedValuesInput.getAttribute('data-constraint-name')

    switch (constraintName) {
      case 'codespaces.allowed_base_images': {
        // eslint-disable-next-line i18n-text/no-en
        this.errorMessage = "Value must be a valid docker image or image prefix ending in '*'."
        /**
         * value is valid if the following conditions are met:
         * 1. Length of value must be greater than zero
         * 2. It can contain at most 1 '*' character, and if so it must be the final character
         * 3. It can end with ':*' but not with ':' --> in order to allow all tags of the base image
         * 4. It matches docker image regex
         */
        const valueWithoutPrefix = value.replace(/(\*|:\*)$/g, '')
        return value.length > 0 && DOCKER_IMAGE_REGEX.test(valueWithoutPrefix) && !valueWithoutPrefix.includes('*')
      }
      default:
        return value.length > 0 && value.length < 100
    }
  }

  toggleMaxValueError({showError}: {showError: boolean}): void {
    if (showError) {
      this.allowedValuesFormGroup.classList.add('errored')
      this.allowedValuesValidationErrorMsg.textContent = this.errorMessage
      showElement(this.allowedValuesValidationErrorMsg)
      return
    }

    this.allowedValuesFormGroup.classList.remove('errored')
    hideElement(this.allowedValuesValidationErrorMsg)
  }

  handleRemoveValue(event: Event): void {
    const button = event.target as HTMLElement

    const container = button.closest('[data-target="allowed-values-input.deleteButtonContainer"]') as HTMLElement

    if (container) {
      this.removeAllowedValueAndDiv(container.getAttribute('data-value') || '', container)
    }
  }

  removeAllowedValueAndDiv(allowedValue: string, div: HTMLElement): void {
    delete this.allowedValues[allowedValue]
    div.remove()
    //save the allowed value to the state
    this.saveAllowedValuesConstraintChange()
    //update display text
    this.updateDisplayText()
  }

  handleInputChange(): void {
    // If input has been cleared, then we should clear any errors
    if (this.allowedValuesInput.value.length === 0) {
      this.toggleMaxValueError({showError: false})
    }
  }
}
