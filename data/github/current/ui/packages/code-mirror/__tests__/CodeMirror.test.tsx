import {screen} from '@testing-library/react'

import {renderCodeMirror, type} from './test-helpers'

const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
  cb(0)
  return 0
})

test('renders the CodeMirror with default setup', async () => {
  const {editorView} = await renderCodeMirror()

  // any selectors used for consuming components/extensions
  expect(editorView.dom.getAttribute('data-testid')).toBe('codemirror-editor')
  expect(editorView.dom).toHaveClass('js-codemirror-editor')

  // eslint-disable-next-line testing-library/no-node-access
  expect(editorView.dom.querySelector('.cm-lineNumbers')).toBeInTheDocument() // line numbers
  expect(screen.getByText('Enter file contents here')).toBeInTheDocument() // default placeholder
})

test('can render an aria label and placeholder', async () => {
  const {editorView} = await renderCodeMirror({
    ariaLabelledBy: 'test label',
    placeholder: 'test placeholder',
  })

  expect(editorView.contentDOM.getAttribute('aria-labelledby')).toContain('test label')
  expect(screen.getByText('test placeholder')).toBeInTheDocument()
})

test('can render as hpc element', async () => {
  const {editorView} = await renderCodeMirror({
    isHpc: true,
  })

  expect(editorView.dom.getAttribute('data-hpc')).toBe('true')
})

test('can render file contents', async () => {
  const {editorView} = await renderCodeMirror({
    value: 'test value',
  })

  expect(editorView.state.doc.toString()).toBe('test value')
})

test('can update file contents', async () => {
  const onChange = jest.fn()

  const {editorView} = await renderCodeMirror({
    value: '',
    onChange,
  })

  expect(editorView.state.doc.toString()).toBe('')

  type(editorView, 'updated value')

  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange).toHaveBeenCalledWith('updated value')
  expect(editorView.state.doc.toString()).toBe('updated value')
})

test('can update file contents externally', async () => {
  const onChange = jest.fn()

  const {editorView, rerender} = await renderCodeMirror({
    value: '',
    onChange,
  })

  expect(editorView.state.doc.toString()).toBe('')

  rerender({
    value: 'updated value',
    onChange,
  })

  expect(editorView.state.doc.toString()).toBe('updated value')
})

test('can focus the editor on next render', async () => {
  // react useImperativeRef is not setting viewRef.current properly so we're just going to spy the raf
  rafSpy.mockClear()

  await renderCodeMirror({
    focusNextRenderRef: {current: true},
  })

  // the first raf is for the initial render
  // the second raf is for the focus
  expect(rafSpy).toHaveBeenCalledTimes(2)
})

test('can skip focusing the editor on next render', async () => {
  // react useImperativeRef is not setting viewRef.current properly so we're just going to spy the raf
  rafSpy.mockClear()

  await renderCodeMirror({
    focusNextRenderRef: {current: false},
  })

  // the first raf is for the initial render
  expect(rafSpy).toHaveBeenCalledTimes(1)
})

test('shows help by default', async () => {
  const {editorView} = await renderCodeMirror()

  expect(editorView.dom).not.toHaveClass('hide-help-until-focus')

  // eslint-disable-next-line testing-library/no-node-access
  expect(editorView.dom.querySelector('.cm-panels-bottom')).toBeVisible()
})

test('can hide help until focus', async () => {
  const {editorView, rerender} = await renderCodeMirror({
    hideHelpUntilFocus: true,
  })

  expect(editorView.dom).toHaveClass('hide-help-until-focus')

  // eslint-disable-next-line testing-library/no-node-access
  expect(editorView.dom.querySelector('.cm-panels-bottom')).not.toBeVisible()

  rerender({
    focusNextRenderRef: {current: true},
  })

  // eslint-disable-next-line testing-library/no-node-access
  expect(editorView.dom.querySelector('.cm-panels-bottom')).toBeVisible()
})
