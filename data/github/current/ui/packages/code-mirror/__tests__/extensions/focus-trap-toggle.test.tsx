import {fireEvent} from '@testing-library/react'
import {renderCodeMirror} from '../test-helpers'

test('focus trap toggle help panel exists and is referenced by aria-labelledby', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.txt',
  })

  const focusTrapHelpID = 'focus-trap-help-panel'

  expect(editorView.contentDOM.getAttribute('aria-labelledby')).toContain(focusTrapHelpID)
  // eslint-disable-next-line testing-library/no-node-access
  expect(editorView.dom.querySelector(`#${focusTrapHelpID}`)).toBeInTheDocument()
})

test('by default, tab inserts indents', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.txt',
    value: 'abc 123',
  })

  editorView.focus()
  expect(editorView.state.doc.toString()).toBe('abc 123')

  // emit tab keyboard event to insert indent (since the focus trap is active by default)
  fireEvent.keyDown(editorView.contentDOM, {key: 'Tab', code: 'Tab', keyCode: 9, which: 9})

  expect(editorView.state.doc.toString()).toBe('  abc 123') // content changed
})

test('can toggle focus trap off and tab out of editor', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.txt',
    value: 'abc 123',
  })

  editorView.focus()

  expect(editorView.state.doc.toString()).toBe('abc 123')

  // toggle focus trap off via keyboard shortcut - ctrl + shift + m
  fireEvent.keyDown(editorView.contentDOM, {
    key: 'M',
    keyCode: 77,
    which: 77,
    code: 'KeyM',
    ctrlKey: true,
    shiftKey: true,
  })

  // emit tab keyboard event to change focus (since the focus trap is now inactive)
  fireEvent.keyDown(editorView.contentDOM, {key: 'Tab', code: 'Tab', keyCode: 9, which: 9})

  expect(editorView.state.doc.toString()).toBe('abc 123') // content didnt change
})
