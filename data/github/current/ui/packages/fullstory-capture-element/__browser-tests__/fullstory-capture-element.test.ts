import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {FullstoryCaptureElement} from '../fullstory-capture-element'

suite('fullstory-capture-element', () => {
  let container: FullstoryCaptureElement

  setup(async function () {
    container = await fixture(html`<fullstory-capture></fullstory-capture>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, FullstoryCaptureElement)
  })
})
