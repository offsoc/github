import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {ShowDialogOnLoadElement} from '../show-dialog-on-load-element'

suite('show-dialog-on-load-element', () => {
  let container: ShowDialogOnLoadElement
  let empty_url_param_container: ShowDialogOnLoadElement

  setup(async function () {
    container = await fixture(html`
      <show-dialog-on-load data-url-param="show-dialog">
        <modal-dialog data-target="show-dialog-on-load.dialog"></modal-dialog>
      </show-dialog-on-load>
    `)
    empty_url_param_container = await fixture(html`
      <show-dialog-on-load data-url-param="">
        <modal-dialog data-target="show-dialog-on-load.dialog"></modal-dialog>
      </show-dialog-on-load>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, ShowDialogOnLoadElement)
  })

  test('does not show dialog on load when display is false and url-param is empty', () => {
    empty_url_param_container.setAttribute('data-display', 'false')
    assert.isTrue(empty_url_param_container.isConnected)

    empty_url_param_container.connectedCallback()
    assert(empty_url_param_container.dialog.open === undefined)
  })

  test('shows dialog on load when display is true, even if url-param is empty', () => {
    empty_url_param_container.setAttribute('data-display', 'true')
    assert.isTrue(empty_url_param_container.isConnected)

    empty_url_param_container.connectedCallback()
    assert.isTrue(empty_url_param_container.dialog.open)
  })

  test('closes dialog if it is open', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, ShowDialogOnLoadElement)

    container.showDialog()
    assert.isTrue(container.dialog.open)

    container.hideDialog()
    assert.isFalse(container.dialog.open)
  })
})
