import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {AnnounceLiveElement} from '../announce-live-element'

suite('announce-live-element', () => {
  let container: AnnounceLiveElement

  setup(async function () {
    container = await fixture(html`<announce-live></announce-live>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, AnnounceLiveElement)
  })
})
