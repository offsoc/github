import {controller} from '@github/catalyst'
import {showPreferences} from '@github-ui/cookie-consent'

@controller
export class CookieConsentLinkElement extends HTMLElement {
  showConsentManagement() {
    showPreferences()
  }
}
