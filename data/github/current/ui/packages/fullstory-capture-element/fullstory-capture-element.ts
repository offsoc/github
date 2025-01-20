import {controller, attr} from '@github/catalyst'
import {waitForConsentPreferences} from '@github-ui/cookie-consent'
import {doNotTrack} from '@github-ui/do-not-track'

import {init} from '@fullstory/browser'

const fsOrgID = 'o-1FH3DA-na1'

@controller
export class FullstoryCaptureElement extends HTMLElement {
  @attr fsScriptDomain = ''

  async connectedCallback() {
    if (doNotTrack()) {
      return
    }

    const consent = await waitForConsentPreferences()
    if (consent?.['Analytics']) {
      const scriptHost = new URL('', this.fsScriptDomain).host
      init({orgId: fsOrgID, script: `${scriptHost}/javascripts/fullstory/fs.js`})
    }
  }
}
