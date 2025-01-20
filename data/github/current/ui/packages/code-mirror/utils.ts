import {indentUnit} from '@codemirror/language'
import {SearchCursor} from '@codemirror/search'
import {EditorSelection, type EditorState} from '@codemirror/state'
import {EditorView} from '@codemirror/view'

export const getCursor = (view: EditorView) => {
  return view.state.selection.main
}

export const setCursor = (view: EditorView, newPosition: number) => {
  view.dispatch({
    selection: {
      anchor: newPosition,
    },
  })
}

export const somethingSelected = (view: EditorView) => {
  return view.state.selection.ranges.some(r => !r.empty)
}

export const getSelection = (state: EditorState) => {
  return state.sliceDoc(state.selection.main.from, state.selection.main.to)
}

export const setSelection = (view: EditorView, startPosition: number, endPosition: number) => {
  view.dispatch({
    selection: {
      anchor: startPosition,
      head: endPosition,
    },
  })
}

// https://codemirror.net/docs/migration/#positions
export function posToOffset(view: EditorView, pos: {line: number; ch: number}) {
  return view.state.doc.line(pos.line + 1).from + pos.ch
}

// https://codemirror.net/docs/migration/#positions
export function offsetToPos(view: EditorView, offset: number) {
  const line = view.state.doc.lineAt(offset)
  return {line: line.number - 1, ch: offset - line.from}
}

export const getLine = (view: EditorView, lineNumber: number) => {
  return view.state.doc.line(lineNumber) // CM6 is 1-indexed for lines
}

export const insertAtStartOfLine = (view: EditorView, lineNumber: number, text: string) => {
  const line = getLine(view, lineNumber)

  replaceRange(view, line.from, line.from, text)
}

export const removeFromStartOfLine = (view: EditorView, lineNumber: number, text: string) => {
  const line = getLine(view, lineNumber)
  replaceRange(view, line.from, line.from + text.length, '')
}

export const replaceSelection = (view: EditorView, text: string) => {
  view.dispatch(view.state.replaceSelection(text))
}

export const getRange = (state: EditorState, from: number, to: number) => {
  return state.sliceDoc(from, to)
}

export const replaceRange = (view: EditorView, from: number, to: number, text: string) => {
  view.dispatch({changes: {from, to, insert: text}})
}

export const insertAtCursor = (view: EditorView, text: string) => {
  const cursor = getCursor(view)
  replaceRange(view, cursor.from, cursor.to, text)
}

/**
 * Find the first occurrence of search in the document
 */
export const find = (view: EditorView, search: string) => {
  const searchCursor = new SearchCursor(view.state.doc, search)
  return searchCursor.next()
}

/**
 * Find and replace the first occurrence of search in the document
 */
export const findAndReplace = (view: EditorView, search: string, replace: string) => {
  const searchCursor = new SearchCursor(view.state.doc, search)
  const match = searchCursor.next()
  view.dispatch({changes: {from: match.value.from, to: match.value.to, insert: replace}})
}

export const moveCursorToPositionAndScroll = (
  view: EditorView,
  startLine: number,
  endLine?: number,
  startColumn?: number,
  endColumn?: number,
) => {
  if (endLine !== undefined) {
    try {
      const startLineElement = getLine(view, startLine)
      const endLineElement = getLine(view, endLine)
      if (startLineElement && endLineElement) {
        view.focus()

        const selectionEnd = endColumn ? endLineElement.from + endColumn : endLineElement.to

        setSelection(view, startLineElement.from + (startColumn ?? 0), selectionEnd)
        view.dispatch({
          effects: [
            EditorView.scrollIntoView(EditorSelection.range(startLineElement.from, endLineElement.to), {y: 'center'}),
          ],
        })
      }
    } catch (RangeError) {
      // Invalid line number, ignore
    }
  } else {
    try {
      const lineElement = getLine(view, startLine)
      if (lineElement) {
        view.focus()
        setCursor(view, lineElement.from + (startColumn ?? 0))
        view.dispatch({effects: [EditorView.scrollIntoView(lineElement.from, {y: 'center'})]})
      }
    } catch (RangeError) {
      // Invalid line number, ignore
    }
  }
}

export function getIndentationUnit(view: EditorView) {
  // returns '\t' or ' '.repeat(indentUnit)
  return view.state.facet(indentUnit)
}
