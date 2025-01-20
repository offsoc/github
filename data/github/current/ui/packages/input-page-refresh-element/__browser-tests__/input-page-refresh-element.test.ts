import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {InputPageRefreshElement} from '../input-page-refresh-element'

suite('input-page-refresh-element', () => {
  let container: InputPageRefreshElement

  setup(async function () {
    container = await fixture(html`<input-page-refresh></input-page-refresh>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, InputPageRefreshElement)
  })
})
