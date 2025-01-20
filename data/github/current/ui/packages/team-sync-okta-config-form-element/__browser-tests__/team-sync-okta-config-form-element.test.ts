import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {TeamSyncOktaConfigFormElement} from '../team-sync-okta-config-form-element'

suite('team-sync-okta-config-form-element', () => {
  let container: TeamSyncOktaConfigFormElement

  setup(async function () {
    container = await fixture(html`<team-sync-okta-config-form></team-sync-okta-config-form>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, TeamSyncOktaConfigFormElement)
  })
})
