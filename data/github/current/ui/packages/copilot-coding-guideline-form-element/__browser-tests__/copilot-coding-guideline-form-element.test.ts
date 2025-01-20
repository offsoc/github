import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {CopilotCodingGuidelineFormElement} from '../copilot-coding-guideline-form-element'

suite('copilot-coding-guideline-form-element', () => {
  let container: CopilotCodingGuidelineFormElement

  setup(async function () {
    container = await fixture(html`
      <copilot-coding-guideline-form>
        <div data-target="copilot-coding-guideline-form.blankslate">No guidelines added</div>
        <ul data-target="copilot-coding-guideline-form.list"></ul>
        <template data-target="copilot-coding-guideline-form.rowTemplate">
          <li data-targets="copilot-coding-guideline-form.rows">
            <input type="text" name="paths[{{index}}]" value="{{path}}" />
            <button data-action="click:copilot-coding-guideline-form#markForDestroy">Delete</button>
          </li>
        </template>
        <form data-action="submit:copilot-coding-guideline-form#addRow">
          <input type="text" data-target="copilot-coding-guideline-form.modalPathInput" />
          <button type="submit">Add Row</button>
        </form>
        <button data-target="copilot-coding-guideline-form.closeModalButton">Close</button>
        <div data-target="copilot-coding-guideline-form.formErrorMessage" hidden>Error</div>
      </copilot-coding-guideline-form>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, CopilotCodingGuidelineFormElement)
  })

  test('blankslate is shown initially', () => {
    assert.isFalse(container.blankslate.hidden)
    assert.equal(container.rows.length, 0)
  })

  test('submitting the form adds a row and hides the blankslate', () => {
    container.modalPathInput.value = 'test/path'
    const form = container.querySelector('form button') as HTMLFormElement
    form.click()

    assert.isTrue(container.blankslate.hidden)
    assert.equal(container.rows.length, 1)
  })

  test('removing all rows shows the blankslate', () => {
    container.modalPathInput.value = 'test/path'
    const button = container.querySelector('form button') as HTMLFormElement
    button.click()
    assert.equal(container.rows.length, 1) // Make sure the row was added

    // Delete the row
    const event = new CustomEvent('coding-guideline-path-marked-for-destroy')
    container.dispatchEvent(event)

    assert.isFalse(container.blankslate.hidden)
  })

  test('row template is processed correctly when adding a new row', () => {
    container.modalPathInput.value = 'test/path'
    const originalDateNow = Date.now
    try {
      Date.now = () => 1234567890 // Hardcode a date for the test

      const button = container.querySelector('form button') as HTMLFormElement
      button.click()

      assert.equal(container.rows.filter(row => !row.hidden).length, 1)
      const addedRow = container.rows[container.rows.length - 1] as HTMLElement
      const input = addedRow.querySelector('input')

      assert.equal(input?.name, 'paths[1234567890]')
      assert.equal(input?.value, 'test/path')
    } finally {
      Date.now = originalDateNow
    }
  })

  test('invalid path shows error message', () => {
    container.modalPathInput.value = 'invalid path with spaces'
    const button = container.querySelector('form button') as HTMLFormElement
    button.click()

    assert.isFalse(container.formErrorMessage.hidden)
  })

  test('valid path hides error message', () => {
    container.modalPathInput.value = 'valid/path'

    const button = container.querySelector('form button') as HTMLFormElement
    button.click()

    assert.isTrue(container.formErrorMessage.hidden)
  })
})
