import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {CopilotBusinessSettingsElement} from '../copilot-business-settings-element'

suite('copilot-business-settings-element', () => {
  let container: CopilotBusinessSettingsElement

  setup(async function () {
    container = await fixture(html`<copilot-business-settings></copilot-business-settings>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopilotBusinessSettingsElement)
  })
})
