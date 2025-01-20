import type {EditorStateConfig, Extension} from '@codemirror/state'
import {type EditorView, type KeyBinding, type ViewUpdate, keymap} from '@codemirror/view'
import {forwardRef, useImperativeHandle, useRef} from 'react'

import {useCodeMirror} from './hooks/use-code-mirror'

export interface CodeMirrorProps extends Omit<EditorStateConfig, 'doc' | 'extensions'> {
  value?: string
  height?: string
  minHeight?: string
  width?: string
  fileName?: string
  placeholder?: string
  ariaLabelledBy: string

  extensions?: Extension[]
  keyBindings?: KeyBinding[]
  spacing: SpacingOptions
  focusNextRenderRef?: React.MutableRefObject<boolean>

  // after CM6 is stable and the default experience
  // consumers will pass extensions in instead of prop based
  enableFileUpload?: boolean
  isHpc?: boolean
  isReadOnly?: boolean
  hideHelpUntilFocus?: boolean

  /** Fired whenever a change occurs to the document. */
  onChange(newValue: string): void
  /** Fired whenever any state change occurs within the editor, including non-document changes like lint results. */
  onUpdate?(viewUpdate: ViewUpdate): void
  /** Fired when the editor is created. */
  onCreateEditor?(view: EditorView): void
  /** Fired when the editor is destroyed. */
  onDestroyEditor?(view: EditorView): void
}

export interface SpacingOptions {
  indentUnit: number
  indentWithTabs: boolean
  lineWrapping: boolean
}

export interface CodeMirrorRef {
  editor?: HTMLDivElement | null
  view?: EditorView
}

const CodeMirror = forwardRef<CodeMirrorRef, CodeMirrorProps>((props, ref) => {
  const {
    value = '',
    extensions = [],
    keyBindings = [],
    height = '85vh',
    width = '100%',
    focusNextRenderRef,
    ...rest
  } = props
  const editorRef = useRef<HTMLDivElement>(null)

  const viewRef = useCodeMirror({
    parentRef: editorRef,
    value,
    height,
    width,
    extensions: [...extensions, keymap.of(keyBindings)],
    ...rest,
  })

  useImperativeHandle(ref, () => ({editor: editorRef.current, view: viewRef.current}), [editorRef, viewRef])

  if (focusNextRenderRef?.current && viewRef) {
    window.requestAnimationFrame(() => {
      if (viewRef.current && !viewRef.current.hasFocus) {
        viewRef.current.focus()
      }
    })
    focusNextRenderRef.current = false
  }

  return <div ref={editorRef} />
})

CodeMirror.displayName = 'CodeMirror'

export default CodeMirror
