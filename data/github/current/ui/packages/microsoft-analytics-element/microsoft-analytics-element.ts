import {controller} from '@github/catalyst'
import {waitForConsentPreferences} from '@github-ui/cookie-consent'
import {doNotTrack} from '@github-ui/do-not-track'
import {initializeAnalytics} from '@github-ui/microsoft-analytics'

@controller
export class MicrosoftAnalyticsElement extends HTMLElement {
  async connectedCallback() {
    if (doNotTrack()) {
      return
    }

    const consentPreferences = await waitForConsentPreferences()
    if (consentPreferences && consentPreferences['Analytics']) {
      initializeAnalytics()
    }
  }
}
