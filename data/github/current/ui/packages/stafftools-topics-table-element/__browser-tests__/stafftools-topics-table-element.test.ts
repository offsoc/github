import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {StafftoolsTopicsTableElement} from '../stafftools-topics-table-element'

suite('stafftools-topics-table-element', () => {
  let container: StafftoolsTopicsTableElement

  setup(async function () {
    container = await fixture(html`<stafftools-topics-table></stafftools-topics-table>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, StafftoolsTopicsTableElement)
  })
})
