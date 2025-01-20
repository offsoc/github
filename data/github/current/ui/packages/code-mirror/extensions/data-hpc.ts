import type {Extension} from '@codemirror/state'
import {EditorView} from '@codemirror/view'

export function dataHpc(): Extension {
  return EditorView.editorAttributes.of({
    'data-hpc': 'true',
  })
}
