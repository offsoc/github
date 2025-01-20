import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {TestCatalystPackageElement} from '../test-catalyst-package-element'

suite('test-catalyst-package-element', () => {
  let container: TestCatalystPackageElement

  setup(async function () {
    container = await fixture(html`<test-catalyst-package></test-catalyst-package>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, TestCatalystPackageElement)
  })
})
