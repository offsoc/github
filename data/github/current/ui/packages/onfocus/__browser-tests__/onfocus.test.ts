import {onInput, onKey} from '../onfocus'
import {assert, fixture, html} from '@github-ui/browser-tests'
import {fire} from 'delegated-events'

suite('focused keyboard', function () {
  let input: HTMLInputElement | null

  setup(async function () {
    const container = await fixture(html`<div id="doc"><input class="foo" /></div>`)
    input = container.querySelector('input')
  })

  if (navigator.userAgent.match('Firefox')) {
    return
  }

  test('onKey', function (done) {
    onKey('keydown', 'input.foo', function (event) {
      const target = event.target as HTMLInputElement

      assert.isNotNull(target)
      assert.isOk(target.matches('input.foo'))
      assert.equal(event.type, 'keydown')

      // We are explicitly testing for the 'a' key here, so we need to disable the eslint rule
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      assert.equal(event.key, 'a')
      done()
    })

    assert.isNotNull(input)
    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
  })

  test('onInput', function (done) {
    onInput('input.foo', function (event) {
      const target = event.target as HTMLInputElement

      assert.isNotNull(target)
      assert.isOk(target.matches('input.foo'))
      assert.equal(event.type, 'input')
      done()
    })

    assert.isNotNull(input)
    input.focus()
    fire(input, 'input')
  })
})
