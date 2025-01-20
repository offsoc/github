import {renderCodeMirror} from '../test-helpers'

test('accessible scroller attributes are applied', async () => {
  const {editorView} = await renderCodeMirror({
    fileName: 'test.txt',
    ariaLabelledBy: 'test-aria-label',
  })

  expect(editorView.scrollDOM.getAttribute('aria-labelledby')).toContain('test-aria-label')
  expect(editorView.scrollDOM.tabIndex).toBe(0)
  expect(editorView.scrollDOM.getAttribute('role')).toBe('region')
})
