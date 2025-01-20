import {renderCodeMirror} from './test-helpers'
import {getCursor, moveCursorToPositionAndScroll} from '../utils'

test('move cursor to line and scroll for single line', async () => {
  const {editorView} = await renderCodeMirror({
    value: 'line1\nline2',
  })

  moveCursorToPositionAndScroll(editorView, 2)

  expect(getCursor(editorView).anchor).toEqual(6)
})

test("won't move cursor to line and scroll if line is out of range", async () => {
  const {editorView} = await renderCodeMirror({
    value: 'line1\nline2',
  })

  moveCursorToPositionAndScroll(editorView, 3)
  expect(getCursor(editorView).anchor).toEqual(0)

  moveCursorToPositionAndScroll(editorView, -1)
  expect(getCursor(editorView).anchor).toEqual(0)
})

test('move cursor to line and scroll for multiple lines', async () => {
  const {editorView} = await renderCodeMirror({
    value: 'line1\nline2\nline3\nline4\nline5',
  })

  moveCursorToPositionAndScroll(editorView, 2, 3)

  expect(getCursor(editorView).anchor).toEqual(6)

  expect(getCursor(editorView).head).toEqual(17)
})

test("won't move cursor to line and scroll if either line is out of range", async () => {
  const {editorView} = await renderCodeMirror({
    value: 'line1\nline2\nline3\nline4\nline5',
  })

  moveCursorToPositionAndScroll(editorView, 3, 6)
  expect(getCursor(editorView).anchor).toEqual(0)

  moveCursorToPositionAndScroll(editorView, -1, 2)
  expect(getCursor(editorView).anchor).toEqual(0)
})

test('when given a start line and start column the cursor moves and scrolls to that position', async () => {
  const {editorView} = await renderCodeMirror({
    value: 'line1\nline2\nline3\nline4\nline5',
  })

  moveCursorToPositionAndScroll(editorView, 2, undefined, 3)
  expect(getCursor(editorView).anchor).toEqual(9)
})

test('when given a start and end range the cursor moves and scrolls to that position', async () => {
  const {editorView} = await renderCodeMirror({
    value: 'line1\nline2\nline3\nline4\nline5',
  })

  moveCursorToPositionAndScroll(editorView, 2, 3, 3, 4)
  expect(getCursor(editorView).anchor).toEqual(9)
  expect(getCursor(editorView).head).toEqual(16)
})
