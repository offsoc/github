import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {EditHookSecretElement} from '../edit-hook-secret-element'

suite('edit-hook-secret-element', () => {
  let container: EditHookSecretElement

  setup(async function () {
    container = await fixture(html`
      <edit-hook-secret>
        <template data-target="edit-hook-secret.editTemplate">
          <div>
            <input type="text" name="hook[secret]" />
            <button data-action="click:edit-hook-secret#toggleView">Cancel</button>
          </div>
        </template>
        <div data-target="edit-hook-secret.view" class="flash">
          <p>
            There is currently a secret configured for this webhook. If you've lost or forgotten this secret, change it,
            change it, but be aware that any integrations using this secret will need to be updated.
          </p>
          <button
            data-action="click:edit-hook-secret#toggleView"
            type="button"
            data-view-component="true"
            class="Button--secondary Button--medium Button"
          >
            <span class="Button-content">
              <span class="Button-label">Change secret</span>
            </span>
          </button>
        </div>
      </edit-hook-secret>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, EditHookSecretElement)
  })
})
