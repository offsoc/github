import {render} from '@github-ui/react-core/test-utils'
import CodeMirror, {type CodeMirrorProps} from '../CodeMirror'
import {noop} from '@github-ui/noop'
import type {EditorState, StateCommand} from '@codemirror/state'
import type {EditorView} from '@codemirror/view'
import {screen, waitFor} from '@testing-library/react'
import {setCursor} from '../utils'

const defaultSpacingOptions = {
  indentUnit: 2,
  indentWithTabs: false,
  lineWrapping: false,
}

const defaultOptions: CodeMirrorProps = {
  ariaLabelledBy: '',
  onChange: noop,
  spacing: defaultSpacingOptions,
}

export async function renderCodeMirror(options?: Partial<Omit<CodeMirrorProps, 'onCreateEditor'>>) {
  let editorView: EditorView | undefined

  const props = {
    ...defaultOptions,
    ...options,
  }

  const utils = render(
    <CodeMirror
      onCreateEditor={view => {
        editorView = view
      }}
      {...props}
    />,
  )

  // eslint-disable-next-line testing-library/prefer-find-by
  await waitFor(() => expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument())

  const {rerender} = utils

  const rerenderUtil = (newOptions?: Partial<Omit<CodeMirrorProps, 'onCreateEditor'>>) => {
    const newProps = {
      ...defaultOptions,
      ...newOptions,
    }

    rerender(
      <CodeMirror
        onCreateEditor={view => {
          editorView = view
        }}
        {...newProps}
      />,
    )
  }

  return {editorView: editorView!, ...utils, rerender: rerenderUtil}
}

export function type(view: EditorView, text: string) {
  const cur = view.state.selection.main.head
  view.dispatch({changes: {from: cur, insert: text}, selection: {anchor: cur + text.length}, userEvent: 'input.type'})
}

export function del(view: EditorView) {
  const cur = view.state.selection.main.head
  view.dispatch({changes: {from: cur - 1, to: cur}, userEvent: 'delete.backward'})
}

export function executeStateCommand(state: EditorState, command: StateCommand) {
  command({
    state,
    dispatch(tr) {
      state = tr.state
    },
  })

  return state
}

export function setCursorToDocStart(view: EditorView) {
  setCursor(view, 0)
}
