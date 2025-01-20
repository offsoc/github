import {indentUnit} from '@codemirror/language'
import {EditorState, type Extension} from '@codemirror/state'
import {EditorView} from '@codemirror/view'
import type {SpacingOptions} from '../CodeMirror'

export const spacingControls = (options: SpacingOptions): Extension[] => {
  const extensions: Extension[] = [EditorState.tabSize.of(options.indentUnit)]

  if (options.indentWithTabs) {
    extensions.push(indentUnit.of('\t'))
  } else {
    extensions.push(indentUnit.of(' '.repeat(options.indentUnit)))
  }

  if (options.lineWrapping) {
    extensions.push(EditorView.lineWrapping)
  }

  return extensions
}
