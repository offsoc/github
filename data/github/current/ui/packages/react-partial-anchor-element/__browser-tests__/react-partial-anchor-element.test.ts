import {assert, fixture, html, setup, suite, test, waitUntil} from '@github-ui/browser-tests'
import {ReactPartialAnchorElement} from '../react-partial-anchor-element'

suite('react-partial-anchor-element', () => {
  let container: ReactPartialAnchorElement

  setup(async function () {
    container = await fixture(
      html`<react-partial-anchor>
        <button data-test-id="anchor" type="button" data-target="react-partial-anchor.anchor">Anchor Button</button>
        <template data-test-id="partial-template" data-target="react-partial-anchor.template">
          <div data-test-id="partial-content">Partial Content</div>
        </template>
      </react-partial-anchor>`,
    )
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, ReactPartialAnchorElement)
  })

  test('Renders the template and removes it', async () => {
    await waitUntil(
      () => container.querySelector('[data-test-id="partial-content"]'),
      'Partial content was not rendered',
      {
        interval: 1,
        timeout: 100,
      },
    )
    assert.isNull(container.querySelector('[data-test-id="partial-template"]'))
  })

  test('Exposes the anchor', async () => {
    const anchor = container.querySelector('[data-test-id="anchor"]')
    assert.equal(anchor, container.anchor)
  })
})
