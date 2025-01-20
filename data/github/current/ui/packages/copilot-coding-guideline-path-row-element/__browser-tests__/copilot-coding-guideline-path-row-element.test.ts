import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {CopilotCodingGuidelinePathRowElement} from '../copilot-coding-guideline-path-row-element'

suite('copilot-coding-guideline-path-row-element', () => {
  let container: CopilotCodingGuidelinePathRowElement

  setup(async function () {
    container = await fixture(
      html`<copilot-coding-guideline-path-row>
        <input type="hidden" value="false" data-target="copilot-coding-guideline-path-row.destroyInput" />
        <button data-action="click:copilot-coding-guideline-path-row#markForDestroy">Delete</button>
      </copilot-coding-guideline-path-row>`,
    )
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopilotCodingGuidelinePathRowElement)
  })

  test('clicking an element with "markForDestroy" sets the destroyInput to true and hides the row ', () => {
    assert.equal(container.destroyInput.value, 'false', 'destroyInput should be false')
    assert.isFalse(container.hidden, 'row should be visible')
    let eventCount = 0
    container.addEventListener('coding-guideline-path-marked-for-destroy', () => {
      eventCount++
    })

    const button = container.querySelector('button') as HTMLButtonElement
    button.click()

    assert.equal(container.destroyInput.value, 'true', 'destroyInput should be true')
    assert.isTrue(container.hidden, 'row should be hidden')
    assert.equal(eventCount, 1, 'should have dispatched the coding-guideline-path-marked-for-destroy event')
  })
})
