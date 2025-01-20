import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {SidebarPinnedTopicsElement} from '../sidebar-pinned-topics-element'

suite('sidebar-pinned-topics-element', () => {
  let container: SidebarPinnedTopicsElement

  setup(async function () {
    container = await fixture(html`<sidebar-pinned-topics></sidebar-pinned-topics>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, SidebarPinnedTopicsElement)
  })
})
