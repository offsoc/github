import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {CopilotMixedLicenseOrgsListElement} from '../copilot-mixed-license-orgs-list-element'

suite('copilot-mixed-license-orgs-list-element', () => {
  let container: CopilotMixedLicenseOrgsListElement

  setup(async function () {
    container = await fixture(html`<copilot-mixed-license-orgs-list></copilot-mixed-license-orgs-list>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopilotMixedLicenseOrgsListElement)
  })
})
