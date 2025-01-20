import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {BillingCountryAndRegionSelectionElement} from '../billing-country-and-region-selection-element'

suite('billing-country-and-region-selection-element', () => {
  let container: BillingCountryAndRegionSelectionElement

  setup(async function () {
    container = await fixture(html`<billing-country-and-region-selection></billing-country-and-region-selection>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, BillingCountryAndRegionSelectionElement)
  })
})
