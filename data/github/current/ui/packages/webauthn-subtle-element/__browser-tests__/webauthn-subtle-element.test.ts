import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {WebauthnSubtleElement} from '../webauthn-subtle-element'

suite('webauthn-subtle-element', () => {
  let container: WebauthnSubtleElement

  setup(async function () {
    container = await fixture(html`<webauthn-subtle></webauthn-subtle>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, WebauthnSubtleElement)
  })
})
