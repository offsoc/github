import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {BusinessShippingInformationElement} from '../business-shipping-information-element'

suite('business-shipping-information-element', () => {
  let container: BusinessShippingInformationElement

  setup(async function () {
    container = await fixture(html`<business-shipping-information></business-shipping-information>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, BusinessShippingInformationElement)
  })
})
