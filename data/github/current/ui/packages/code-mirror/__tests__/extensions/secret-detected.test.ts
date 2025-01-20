import {emitToCodeMirror} from '../../emit-to-codemirror'
import {renderCodeMirror} from '../test-helpers'

test('can emit secret detected linting', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.md',
    value: 'Hello world CLOJARS_770584d is my secret shhhh',
  })

  expect(editorView.state.doc.toString()).toBe('Hello world CLOJARS_770584d is my secret shhhh')
  expect(editorView.dom.querySelector('.CodeMirror-lint-mark-error')).not.toBeInTheDocument()

  emitToCodeMirror('secret-detected:lint', editorView.dom, {
    from: {
      lineNumber: 0,
      character: 12,
    },
    to: {lineNumber: 0, character: 27},
    severity: 'error',
  })

  // value doesn't change, but lint marks are added
  expect(editorView.state.doc.toString()).toBe('Hello world CLOJARS_770584d is my secret shhhh')
  expect(editorView.dom.querySelector('.CodeMirror-lint-mark-error')).toBeInTheDocument()
})
