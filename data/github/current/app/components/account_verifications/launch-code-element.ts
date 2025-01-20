import {attr, controller, target, targets} from '@github/catalyst'

@controller
class LaunchCodeElement extends HTMLElement {
  @target form: HTMLFormElement
  @targets inputs: HTMLInputElement[]
  @target result: HTMLElement
  @attr pattern: string
  @attr ajax = false

  connectedCallback() {
    this.handleLoaded()
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault()
    const clipboardData = event.clipboardData

    if (!clipboardData) return

    const launchCode = clipboardData.getData('text')

    const launchCodeRegExp = new RegExp(`^${this.pattern}*$`)
    if (!launchCodeRegExp.test(launchCode)) return

    let lastInputElement

    for (const inputField of this.inputs) {
      const thisInputIndex = this.inputs.indexOf(inputField)
      lastInputElement = inputField
      if (!launchCode[thisInputIndex]) break
      inputField.value = launchCode[thisInputIndex]!
    }

    if (this.form.checkValidity()) {
      this.submit()
    } else {
      lastInputElement?.focus()
    }
  }

  handleKeyInput(event: Event) {
    const input = event.target as HTMLInputElement
    const thisInputIndex = this.inputs.indexOf(input)
    const nextInput = this.inputs[thisInputIndex + 1]

    if (this.result.innerHTML.trim() !== '') {
      // If we were displaying an error but the user
      // is now entering a new code, clear the current
      // error message.
      this.result.textContent = ''
    }

    if (input.checkValidity()) {
      if (nextInput) {
        this.form.checkValidity() ? this.submit() : nextInput.focus()
      } else {
        if (this.form.reportValidity()) this.submit()
      }
    } else {
      input.value = ''
    }
  }

  handleKeyNavigation(event: KeyboardEvent) {
    // TODO: Refactor to use data-hotkey
    /* eslint eslint-comments/no-use: off */
    /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
    const navigationKeys = ['Backspace', 'ArrowLeft', 'ArrowRight']
    if (!navigationKeys.includes(event.key)) return

    const input = event.target as HTMLInputElement
    const thisInputIndex = this.inputs.indexOf(input)
    const nextInput = this.inputs[thisInputIndex + 1]

    switch (event.key) {
      case 'Backspace': {
        const previousInput = this.inputs[thisInputIndex - 1]
        if (previousInput) {
          this.moveCursorToEndOfInput(previousInput)
          previousInput.value = ''
          this.result.textContent = ''
        }
        return
      }
      case 'ArrowLeft': {
        const previousInput = this.inputs[thisInputIndex - 1]
        if (previousInput) this.moveCursorToEndOfInput(previousInput)
        return
      }
      case 'ArrowRight': {
        if (nextInput) this.moveCursorToEndOfInput(nextInput)
        return
      }
    }
    /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
  }

  moveCursorToEndOfInput(input: HTMLInputElement) {
    const length = input.value.length
    input.focus()
    input.setSelectionRange(length, length)
  }

  async submit() {
    if (this.ajax) {
      const response = await fetch(this.form.action, {
        method: this.form.method,
        body: new FormData(this.form),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (response.ok) {
        this.result.innerHTML = await response.text()
        this.dispatchEvent(new CustomEvent('launch-code-success', {bubbles: true}))
      } else {
        this.result.innerHTML = await response.text()

        // If we have previously returned an error message (the field is 'dirty'), we need
        // to force the screen reader to see a new error message
        if (this.result.getAttribute('data-dirty') === 'true') {
          this.forceResultScreenReaderAnnounce()
        } else {
          this.result.setAttribute('data-dirty', 'true')
        }

        this.clearEnteredCode()

        this.dispatchEvent(new CustomEvent('launch-code-error', {bubbles: true}))
      }
    } else {
      this.form.submit()
    }
  }

  handleLoaded() {
    if (this.result.innerHTML.trim() !== '') {
      this.forceResultScreenReaderAnnounce()
    }
  }

  private forceResultScreenReaderAnnounce() {
    // This is a hack to force the screen reader to read out the message.
    // See https://github.com/github/accessibility/issues/290 where we do
    // something similar for our flash messages.
    setTimeout(() => {
      if (this.result.firstElementChild) {
        this.result.firstElementChild.appendChild(document.createTextNode('\u00a0'))
      }
    }, 200)
  }

  private clearEnteredCode() {
    for (const input of this.inputs) {
      input.value = ''
    }

    this.inputs[0]?.focus()
  }
}
