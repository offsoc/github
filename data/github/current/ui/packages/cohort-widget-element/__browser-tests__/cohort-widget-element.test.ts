import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {CohortWidgetElement} from '../cohort-widget-element'

suite('cohort-widget-element', () => {
  let container: CohortWidgetElement

  setup(async function () {
    container = await fixture(html`<cohort-widget></cohort-widget>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CohortWidgetElement)
  })
})
