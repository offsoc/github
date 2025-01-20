import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {TaskComponentElement} from '../task-component-element'

suite('task-component-element', () => {
  let container: TaskComponentElement

  setup(async function () {
    container = await fixture(html`<task-component></task-component>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, TaskComponentElement)
  })
})
