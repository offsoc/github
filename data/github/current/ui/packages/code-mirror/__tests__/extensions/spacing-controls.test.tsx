import type {SpacingOptions} from '../../CodeMirror'
import {insertIndent} from '../../extensions/focus-trap-toggle'
import {spacingControls} from '../../extensions/spacing-controls'
import {executeStateCommand, renderCodeMirror, setCursorToDocStart} from '../test-helpers'

interface FacetProvider<T> {
  value: T
}

test('can create spacing options with tabs and line wrapping', () => {
  const spacingOptions: SpacingOptions = {
    indentUnit: 2,
    indentWithTabs: true,
    lineWrapping: true,
  }

  const extensions = spacingControls(spacingOptions)

  const indentUnitExtension = extensions[0] as unknown as FacetProvider<number>
  const indentWithTabsExtension = extensions[1] as unknown as FacetProvider<string>
  const lineWrappingExtension = extensions[2] as unknown as FacetProvider<{class: string}>

  expect(extensions.length).toBe(3)
  expect(indentUnitExtension.value).toBe(2)
  expect(indentWithTabsExtension.value).toBe('\t')
  expect(lineWrappingExtension.value).toStrictEqual({class: 'cm-lineWrapping'})
})

test('can create spacing without tabs and line wrapping', () => {
  const spacingOptions: SpacingOptions = {
    indentUnit: 4,
    indentWithTabs: false,
    lineWrapping: false,
  }

  const extensions = spacingControls(spacingOptions)

  const indentUnitExtension = extensions[0] as unknown as FacetProvider<number>
  const indentWithTabsExtension = extensions[1] as unknown as FacetProvider<string>

  expect(extensions.length).toBe(2)
  expect(indentUnitExtension.value).toBe(4)
  expect(indentWithTabsExtension.value).toBe('    ')
})

test('insertIndent command inserts tab when indentWithTabs is true', async () => {
  const {editorView} = await renderCodeMirror({
    value: 'abc 123',
    spacing: {
      indentUnit: 2,
      indentWithTabs: true,
      lineWrapping: false,
    },
  })

  setCursorToDocStart(editorView)

  const initialEditorState = editorView.state
  expect(initialEditorState.doc.toString()).toBe('abc 123')

  const newEditorState = executeStateCommand(initialEditorState, insertIndent)

  expect(newEditorState.doc.toString()).toBe('\tabc 123')
})

test('insertIndent command inserts spaces when indentWithTabs is false', async () => {
  const {editorView} = await renderCodeMirror({
    value: 'abc 123',
    spacing: {
      indentUnit: 2,
      indentWithTabs: false,
      lineWrapping: false,
    },
  })

  setCursorToDocStart(editorView)

  const initialEditorState = editorView.state
  expect(initialEditorState.doc.toString()).toBe('abc 123')

  const newEditorState = executeStateCommand(initialEditorState, insertIndent)

  expect(newEditorState.doc.toString()).toBe('  abc 123')
})
