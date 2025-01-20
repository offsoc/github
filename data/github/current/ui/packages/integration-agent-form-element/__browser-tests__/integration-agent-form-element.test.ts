import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {IntegrationAgentFormElement} from '../integration-agent-form-element'

suite('integration-agent-form-element', () => {
  let container: IntegrationAgentFormElement

  setup(async function () {
    container = await fixture(html`<integration-agent-form></integration-agent-form>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, IntegrationAgentFormElement)
  })
})
