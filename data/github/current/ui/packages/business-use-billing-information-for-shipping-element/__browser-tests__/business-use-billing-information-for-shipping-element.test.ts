import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {BusinessUseBillingInformationForShippingElement} from '../business-use-billing-information-for-shipping-element'

suite('business-use-billing-information-for-shipping-element', () => {
  let container: BusinessUseBillingInformationForShippingElement

  setup(async function () {
    container = await fixture(
      html`<business-use-billing-information-for-shipping></business-use-billing-information-for-shipping>`,
    )
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, BusinessUseBillingInformationForShippingElement)
  })
})
