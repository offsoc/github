import {emitToCodeMirror} from '../../emit-to-codemirror'
import {renderCodeMirror} from '../test-helpers'
import {setSelection} from '../../utils'

test('can insert text while uploading', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.md',
    enableFileUpload: true,
  })

  expect(editorView.state.doc.toString()).toBe('')

  emitToCodeMirror('upload:editor:change', editorView.dom, {
    state: 'uploading',
    placeholder: '[Uploading asset-name](...)',
    replacementText: '[Uploading asset-name](...)',
  })

  expect(editorView.state.doc.toString()).toBe('[Uploading asset-name](...)')

  emitToCodeMirror('upload:editor:change', editorView.dom, {
    state: 'uploaded',
    placeholder: '[Uploading asset-name](...)',
    replacementText: '[asset-name.jpg](www.github.com)',
  })

  expect(editorView.state.doc.toString()).toBe('[asset-name.jpg](www.github.com)')
})

test('can replace selected text when uploading', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.md',
    enableFileUpload: true,
    value: 'test value',
  })

  expect(editorView.state.doc.toString()).toBe('test value')
  setSelection(editorView, 5, 10) // select 'value'

  emitToCodeMirror('upload:editor:change', editorView.dom, {
    state: 'uploading',
    placeholder: '[Uploading asset-name](...)',
    replacementText: '[Uploading asset-name](...)',
  })

  expect(editorView.state.doc.toString()).toBe('test [Uploading asset-name](...)')

  emitToCodeMirror('upload:editor:change', editorView.dom, {
    state: 'uploaded',
    placeholder: '[Uploading asset-name](...)',
    replacementText: '[asset-name.jpg](www.github.com)',
  })

  expect(editorView.state.doc.toString()).toBe('test [asset-name.jpg](www.github.com)')
})

test('can update text if upload fails', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.md',
    enableFileUpload: true,
  })

  expect(editorView.state.doc.toString()).toBe('')

  emitToCodeMirror('upload:editor:change', editorView.dom, {
    state: 'uploading',
    placeholder: '[Uploading asset-name](...)',
    replacementText: '[Uploading asset-name](...)',
  })

  expect(editorView.state.doc.toString()).toBe('[Uploading asset-name](...)')

  emitToCodeMirror('upload:editor:change', editorView.dom, {
    state: 'failed',
    placeholder: '[Uploading asset-name](...)',
    replacementText: '',
  })

  expect(editorView.state.doc.toString()).toBe('')
})
