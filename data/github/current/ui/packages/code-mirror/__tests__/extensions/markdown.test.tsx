import {screen, waitFor} from '@testing-library/react'

import {renderCodeMirror, setCursorToDocStart} from '../test-helpers'
import {
  insertBoldToken,
  insertCodeToken,
  insertItalicToken,
  insertLink,
  toggleBlockQuoteList,
  toggleOrderedList,
  toggleUnorderedList,
} from '../../extensions/markdown'
import type {Command} from '@codemirror/view'
import {getCursor, setSelection} from '../../utils'

interface CommandTest {
  initialValue: string
  command: Command
  selectionStart?: number
  selectionEnd?: number
  expectedValue: string
  expectedCursorStart: number
  expectedCursorEnd?: number
}

const commandTests: CommandTest[] = [
  // insert / toggle on
  {command: insertItalicToken, initialValue: '', expectedValue: '__', expectedCursorStart: 1},
  {command: insertBoldToken, initialValue: '', expectedValue: '****', expectedCursorStart: 2},
  {command: insertCodeToken, initialValue: '', expectedValue: '``', expectedCursorStart: 1},
  {command: insertLink, initialValue: '', expectedValue: '[](url)', expectedCursorStart: 1},
  {command: toggleBlockQuoteList, initialValue: '', expectedValue: '> ', expectedCursorStart: 2},
  {command: toggleOrderedList, initialValue: '', expectedValue: '1. ', expectedCursorStart: 3},
  {command: toggleUnorderedList, initialValue: '', expectedValue: '- ', expectedCursorStart: 2},

  // toggle off
  {command: toggleBlockQuoteList, initialValue: '> ', expectedValue: '', expectedCursorStart: 0},
  {command: toggleOrderedList, initialValue: '1. ', expectedValue: '', expectedCursorStart: 0},
  {command: toggleUnorderedList, initialValue: '- ', expectedValue: '', expectedCursorStart: 0},

  // with selection
  {
    command: insertItalicToken,
    initialValue: 'abc foo 123',
    selectionStart: 4,
    selectionEnd: 7,
    expectedValue: 'abc _foo_ 123',
    expectedCursorStart: 9,
  },
  {
    command: insertBoldToken,
    initialValue: 'abc foo 123',
    selectionStart: 4,
    selectionEnd: 7,
    expectedValue: 'abc **foo** 123',
    expectedCursorStart: 11,
  },
  {
    command: insertCodeToken,
    initialValue: 'abc foo 123',
    selectionStart: 4,
    selectionEnd: 7,
    expectedValue: 'abc `foo` 123',
    expectedCursorStart: 9,
  },
  {
    command: insertLink,
    initialValue: 'abc foo 123',
    selectionStart: 4,
    selectionEnd: 7,
    expectedValue: 'abc [foo](url) 123',
    expectedCursorStart: 10,
    expectedCursorEnd: 13,
  },
]

test.each(commandTests)(
  'markdown command %p',
  async ({
    initialValue,
    command,
    expectedValue,
    selectionStart,
    selectionEnd,
    expectedCursorStart,
    expectedCursorEnd,
  }) => {
    const {editorView} = await renderCodeMirror({
      value: initialValue,
      spacing: {
        indentUnit: 2,
        indentWithTabs: false,
        lineWrapping: false,
      },
    })

    if (selectionStart && selectionEnd) {
      setSelection(editorView, selectionStart, selectionEnd)
    } else {
      setCursorToDocStart(editorView)
    }

    expect(editorView.state.doc.toString()).toBe(initialValue)

    command(editorView)

    expect(editorView.state.doc.toString()).toBe(expectedValue)
    expect(getCursor(editorView).anchor).toBe(expectedCursorStart)
    expect(getCursor(editorView).head).toBe(expectedCursorEnd ?? expectedCursorStart) // if no selection, cursor is at the same position
  },
)

test('dir=auto is set', async () => {
  // task lists are gfm-specific
  // other tokens like ### for headings are generic markdown highlighting
  const {editorView} = await renderCodeMirror({
    value: `
## Tasklist
* [ ] to do
* [x] done`,
    fileName: 'test.md',
  })

  await waitFor(() =>
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('codemirror-editor').querySelector('[data-language="markdown"]')).toBeInTheDocument(),
  )

  // eslint-disable-next-line testing-library/no-node-access
  expect(editorView.dom.querySelector('.cm-line')).toHaveAttribute('dir', 'auto')
})
