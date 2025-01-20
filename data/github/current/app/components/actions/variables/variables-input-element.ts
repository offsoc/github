import {attr, controller, target} from '@github/catalyst'

@controller
class VariablesInputElement extends HTMLElement {
  static readonly NAME_REGEX = '^[A-Za-z_][A-Za-z0-9_]*$'
  static readonly GITHUB_REGEX = '^[gG][iI][tT][hH][uU][bB]_'
  static readonly FIRST_CHAR_REGEX = '^[A-Za-z_]'

  static readonly FIRST_CHAR_RULES = 'Variable name can only start with a letter or underscore.'
  static readonly GITHUB_PREFIX_RULE = 'Variable name cannot start with "GITHUB_" prefix.'
  static readonly NAME_RULE =
    'Variable name can only contain alphanumeric characters.\n Special characters and spaces are not allowed.'
  static readonly DEFAULT_CREATE_ERROR = 'Unable to add variable. Please try again.'
  static readonly DEFAULT_UPDATE_ERROR = 'Unable to update variable. Please try again.'
  static readonly ADD_BUTTON_TEXT = 'Add variable'
  static readonly ADD_BUTTON_DISABLED_TEXT = 'Adding...'
  static readonly UPDATE_BUTTON_TEXT = 'Save variable'
  static readonly UPDATE_BUTTON_DISABLED_TEXT = 'Saving...'
  static readonly ADD_OPERATION = 'add'
  static readonly UPDATE_OPERATION = 'update'

  @target name: HTMLInputElement
  @target validationError: HTMLSpanElement
  @target validationMessage: HTMLDivElement
  @target submitButton: HTMLButtonElement
  @target form: HTMLFormElement

  @attr operation: string

  nameInput() {
    const value = this.name.value
    if (value === '') {
      this.hideValidationError()
      return
    }

    const startsWithGithub = value.match(VariablesInputElement.GITHUB_REGEX)
    if (startsWithGithub) {
      this.setNameValidationError(VariablesInputElement.GITHUB_PREFIX_RULE)
      return
    } else {
      this.hideValidationError()
    }

    const startsWithValidChar = value.match(VariablesInputElement.FIRST_CHAR_REGEX)
    if (startsWithValidChar) {
      this.hideValidationError()
    } else {
      this.setNameValidationError(VariablesInputElement.FIRST_CHAR_RULES)
      return
    }

    const validName = value.match(VariablesInputElement.NAME_REGEX)
    if (validName) {
      this.hideValidationError()
    } else {
      this.setNameValidationError(VariablesInputElement.NAME_RULE)
    }
  }

  setNameValidationError(error: string) {
    this.name.setCustomValidity(error)
    this.name.style.borderColor = 'var(--borderColor-danger-emphasis, var(--color-danger-emphasis))'
    this.showValidationMessage(error)
  }

  showValidationMessage(error: string) {
    this.validationError.textContent = error
    this.validationMessage.hidden = false
  }

  hideValidationMessage() {
    this.validationMessage.hidden = true
  }

  hideValidationError() {
    this.name.setCustomValidity('')
    this.name.style.borderColor = ''
    this.hideValidationMessage()
    this.submitDisabled = false
  }

  get submitDisabled(): boolean {
    return this.submitButton.hasAttribute('aria-disabled')
  }

  set submitDisabled(value: boolean) {
    if (value) {
      this.submitButton.setAttribute('aria-disabled', 'true')
    } else {
      this.submitButton.removeAttribute('aria-disabled')
    }
    this.submitButton.classList.toggle('disabled', value)
  }

  set submitButtonText(value: string) {
    this.submitButton.textContent = value
  }

  private async submit(event: Event) {
    event.preventDefault()
    if (this.submitDisabled) return
    this.hideValidationMessage()

    this.submitDisabled = true
    if (this.operation === VariablesInputElement.ADD_OPERATION) {
      this.submitButtonText = VariablesInputElement.ADD_BUTTON_DISABLED_TEXT
    } else {
      this.submitButtonText = VariablesInputElement.UPDATE_BUTTON_DISABLED_TEXT
    }

    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: new FormData(this.form),
      })

      if (response.ok) {
        window.location.replace(response.url)
      } else {
        const data = await response.json()
        const status = data.status
        if (status === 409) {
          this.setNameValidationError(data.error)
        } else {
          this.showValidationMessage(data.error)
        }

        // Do not enable submit button incase variable already exists or the variable limit has been reached
        if (status !== 429 && status !== 409) {
          this.submitDisabled = false
        }
      }
    } catch (error) {
      this.showValidationMessage(VariablesInputElement.DEFAULT_CREATE_ERROR)
      this.submitDisabled = false
    }

    if (this.operation === VariablesInputElement.ADD_OPERATION) {
      this.submitButtonText = VariablesInputElement.ADD_BUTTON_TEXT
    } else {
      this.submitButtonText = VariablesInputElement.UPDATE_BUTTON_TEXT
    }
  }
}
