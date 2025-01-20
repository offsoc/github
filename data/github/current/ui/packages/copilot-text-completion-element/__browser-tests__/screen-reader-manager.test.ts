import {assert, suite, fixture, html} from '@github-ui/browser-tests'
import {ScreenReaderManager} from '../screen-reader-manager'

suite('screen-reader-manager', () => {
  let container: HTMLDivElement
  let dialogText: HTMLDivElement
  let dialogFullText: HTMLDivElement
  let dialogFullTextToggle: HTMLDetailsElement
  let screenReaderManager: ScreenReaderManager

  setup(async function () {
    container = await fixture(
      html`<div>
        <div data-target="copilot-text-completion.accessibleDialogText" id="dialog_text"></div>
        <details
          data-target="copilot-text-completion.accessibleDialogFullTextToggle"
          id="dialog_full_text_toggle"
        ></details>
        <div data-target="copilot-text-completion.accessibleDialogFullText" id="dialog_full_text"></div>
      </div>`,
    )

    dialogText = container.querySelector('#dialog_text') as HTMLDivElement
    dialogFullText = container.querySelector('#dialog_full_text') as HTMLDivElement
    dialogFullTextToggle = container.querySelector('#dialog_full_text') as HTMLDetailsElement
    screenReaderManager = new ScreenReaderManager(dialogText, dialogFullText, dialogFullTextToggle)
  })

  test('clearSuggestion', () => {
    dialogText.textContent = 'suggestion'
    assert.equal(dialogText.textContent, 'suggestion')
    screenReaderManager.clearSuggestion()
    assert.equal(dialogText.textContent, '')
  })

  test('clearFullText', () => {
    dialogFullText.textContent = 'suggestion'
    assert.equal(dialogFullText.textContent, 'suggestion')
    screenReaderManager.clearFullText()
    assert.equal(dialogFullText.textContent, '')
  })

  test('hideFullText', () => {
    dialogFullTextToggle.setAttribute('open', '')
    assert(dialogFullTextToggle.hasAttribute('open'))
    screenReaderManager.hideFullText()
    assert(!dialogFullTextToggle.hasAttribute('open'))
  })

  test('addCompletionToInspector', () => {
    dialogText.textContent = ''
    screenReaderManager.addCompletionToInspector('completion')
    assert.equal(dialogText.textContent, 'completion')
  })

  test('addFullTextToInspector', () => {
    dialogFullText.textContent = ''
    screenReaderManager.addFullTextToInspector('completion')
    assert.equal(dialogFullText.textContent, 'completion')
  })
})
