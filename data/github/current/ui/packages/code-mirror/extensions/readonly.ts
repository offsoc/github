import {EditorState, type Extension} from '@codemirror/state'

export function readOnly(): Extension {
  return EditorState.readOnly.of(true)
}
