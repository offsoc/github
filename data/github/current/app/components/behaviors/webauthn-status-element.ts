import {controller, target} from '@github/catalyst'
import {webauthnSupportLevel, iuvpaaSupportLevel} from '@github-ui/webauthn-support-level'

@controller
export default class WebauthnStatusElement extends HTMLElement {
  @target supported: HTMLElement
  @target partial: HTMLElement
  @target unsupported: HTMLElement
  @target fragment: HTMLElement

  async connectedCallback() {
    const webauthnSupported = await webauthnSupportLevel()
    const iuvpaaSupported = await iuvpaaSupportLevel()
    this.renderElement(webauthnSupported === 'supported', iuvpaaSupported === 'supported')
  }

  renderElement(webauthnSupported: boolean, iuvpaaSupported: boolean) {
    // webauthn support
    if (this.partial) {
      // if webauthnSupported, hidden should be false
      this.partial.hidden = !webauthnSupported
    }

    // similar to `partial`, if webauthn is supported, we need to set the src on the include-fragment
    //  for it to fetch the webauthn login UX (login_fragment).
    // This stops us from making the login_fragment call unnessesarily
    if (this.fragment && webauthnSupported) {
      const url = this.fragment.getAttribute('data-src')!
      this.fragment.setAttribute('src', url)
    }
    // webauthn & UVPA support
    if (this.supported) {
      // if iuvpaaSupported, hidden should be false
      this.supported.hidden = !iuvpaaSupported
    }
    // no support
    if (this.unsupported) {
      // if iuvpaaSupported, hidden should be true
      this.unsupported.hidden = iuvpaaSupported
    }
  }
}
