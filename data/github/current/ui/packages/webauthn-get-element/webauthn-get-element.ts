import {attr, controller, target, targets} from '@github/catalyst'
import {get, parseRequestOptionsFromJSON, supported} from '@github/webauthn-json/browser-ponyfill'
import type {CredentialRequestOptionsJSON} from '@github/webauthn-json/browser-ponyfill'
import {requestSubmit} from '@github-ui/form-utils'

// An event dispatched by `WebauthnGetElement` when a normal get request is initiated
const webauthnGetEvent = 'webauthn-get-prompt'
// An event dispatched by `WebauthnSubtleElement` when its button is submitted
const webauthnSubtleEvent = 'webauthn-subtle-submit'

export enum State {
  Initializing = 'initializing',
  Unsupported = 'unsupported',
  Ready = 'ready',
  Waiting = 'waiting',
  Error = 'error',
  Submitting = 'submitting',
}

@controller
export class WebauthnGetElement extends HTMLElement {
  state: State = State.Initializing
  @target button: HTMLButtonElement
  @target buttonText: HTMLElement
  // `messages` contains all the message elements.
  @targets messages: HTMLElement[]
  @target capitalizedDescription: HTMLElement
  @target unsupportedMessage: HTMLElement
  @target passkeysUnsupportedMessage: HTMLElement
  @target waitingMessage: HTMLElement
  @target errorMessage: HTMLElement
  @target errorText: HTMLElement

  static attrPrefix = ''
  @attr dataJson = ''
  @attr subtleLogin = false
  private originalButtonText: string
  private hasErrored = false
  private originalErrorText: string | null
  private passkeySupport: boolean

  async connectedCallback() {
    this.originalButtonText = this.getCurrentButtonText()
    this.originalErrorText = this.errorText.textContent
    this.setState(supported() ? State.Ready : State.Unsupported)
    this.passkeySupport = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable()
    // show the passkey unsupported message if it's present on the page (renders when the user has passkeys)
    // and we're not already showing the webauthn unsupported message
    if (this.state !== State.Unsupported && !this.passkeySupport && this.passkeysUnsupportedMessage) {
      this.passkeysUnsupportedMessage.hidden = false
    }
    // if this get request is for login and the user doesn't have any passkeys
    if (this.subtleLogin) {
      this.handleWebauthnSubtle()
    } else {
      this.showWebauthnLoginFragment()
    }
  }

  // Handles login specific webauthn-get behavior.
  // Reveals and prepares webauthn-subtle behavior for the subtle webauthn login scenario.
  handleWebauthnSubtle(): void {
    // show the subtle UX. webauthn-get loads last so we don't need to worry about if it isn't already on the page
    const subtle = document.querySelector<HTMLElement>('.js-webauthn-subtle')!
    if (!subtle) {
      return
    }

    subtle.hidden = false
    this.updateWebauthnSubtleParentBoxVisibility(false)
    subtle.addEventListener(webauthnSubtleEvent, () => {
      this.showWebauthnLoginFragment()
      // if user tries subtle passkey login from an unsupported browser, show the unsupported UX but don't trigger the prompt
      if (this.state !== State.Unsupported) {
        this.prompt()
      }
    })
  }

  // Handles login specific webauthn-get behavior.
  // Reveals main webauthn login component and hides the webauthn subtle hint - used for the subtle:false login scenario
  // and for switching from subtle over to the main passkey login UX after user input.
  showWebauthnLoginFragment(): void {
    // grab and reveal parent webauthn section that isn't a catalyst component
    const loginFragment = document.querySelector<HTMLElement>('.js-webauthn-login-section')!
    if (!loginFragment) {
      return
    }
    loginFragment.hidden = false

    // also hide the parent box for the webauthn subtle component
    // this is nessesary when it's the only content in the login alternatives box for subtle:false logins
    this.updateWebauthnSubtleParentBoxVisibility(true)
  }

  updateWebauthnSubtleParentBoxVisibility(hidden: boolean): void {
    const parentDiv = document.querySelector<HTMLElement>('.js-webauthn-hint')!
    if (!parentDiv) {
      return
    }
    parentDiv.hidden = hidden
  }

  getCurrentButtonText(): string {
    return this.buttonText.textContent || ''
  }

  setCurrentButtonText(text: string): void {
    this.buttonText.textContent = text
  }

  setState(state: State): void {
    // Reset to defaults
    const retryMessage = this.button.getAttribute('data-retry-message') || this.originalButtonText
    const buttonText = this.hasErrored ? retryMessage : this.originalButtonText
    this.setCurrentButtonText(buttonText)
    this.button.disabled = false
    this.button.hidden = false
    this.errorText.textContent = ''
    for (const elem of this.messages) {
      elem.hidden = true
    }

    switch (state) {
      case State.Initializing:
        this.button.disabled = true
        break
      case State.Unsupported:
        this.button.disabled = true
        this.unsupportedMessage.hidden = false
        // hide the passkey specific error if we're showing the generic one
        if (this.passkeysUnsupportedMessage) {
          this.passkeysUnsupportedMessage.hidden = true
        }
        break
      case State.Ready:
        break
      case State.Waiting:
        this.waitingMessage.hidden = false
        this.button.hidden = true
        break
      case State.Error:
        this.errorMessage.hidden = false
        this.errorText.textContent = this.originalErrorText
        break
      case State.Submitting:
        this.setCurrentButtonText('Verifying…')
        this.button.disabled = true
        break
      default:
        throw new Error('invalid state')
    }

    this.state = state
  }

  // silent_unless_success: don't show waiting or error status. This is for automatically attempting a prompt at
  // page/modal load time, without showing confusing UI if the browser rejects the attempt due to a missing user
  // gesture. Most browsers allow at least one such prompt per page load, but we can't rely on it. In theory we could
  // try to show an error to the user depending on the `get` rejection, but the spec is still in flux and browsers
  // constantly change their mind (and have bugs). So we err on the side of not showing an error.
  async prompt(event?: Event, silent_unless_success?: boolean): Promise<void> {
    event?.preventDefault() // prevent default page form submission
    this.dispatchEvent(new CustomEvent(webauthnGetEvent))
    try {
      if (!silent_unless_success) {
        this.setState(State.Waiting)
      }

      const json: CredentialRequestOptionsJSON = JSON.parse(this.dataJson)
      const signResponse = await get(parseRequestOptionsFromJSON(json))
      this.setState(State.Submitting)

      // Each `<webauthn-get>` element is currently embedded in a form (not
      // the other way around), so we have to query for the form outside of it.
      const form = this.closest<HTMLFormElement>('.js-webauthn-form')!
      const responseField = form.querySelector<HTMLInputElement>('.js-webauthn-response')!
      responseField.value = JSON.stringify(signResponse)
      requestSubmit(form)
    } catch (error) {
      if (!silent_unless_success) {
        this.hasErrored = true
        this.setState(State.Error)
        throw error
      }
    }
  }
}
