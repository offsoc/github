import {controller} from '@github/catalyst'

// An event dispatched by `WebauthnSubtleElement` when its button is submitted
const webauthnSubtleEvent = 'webauthn-subtle-submit'

@controller
// This component is loaded for every cached `/login` get. It's visibility is decided by the webauthn-get connected
// callback in webauthn-get-element.ts after after the webauthn login_fragment is loaded for login
export class WebauthnSubtleElement extends HTMLElement {
  // Prompt: hides the subtle element and triggers the event that makes the main passkey login UX visible
  prompt() {
    this.dispatchEvent(new CustomEvent(webauthnSubtleEvent))
    this.hidden = true

    // also hide the parent box if webauthn in the only content
    const parentDiv = document.querySelector<HTMLElement>('.js-webauthn-hint')!
    if (!parentDiv) {
      return
    }
    parentDiv.hidden = true
  }
}
