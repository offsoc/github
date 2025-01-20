import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {CopyProjectElement} from '../copy-project-element'

suite('copy-project-element', () => {
  let container: CopyProjectElement

  setup(async function () {
    container = await fixture(html`<copy-project></copy-project>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopyProjectElement)
  })
})
