import {linter, type LintSource} from '@codemirror/lint'
import type {Extension} from '@codemirror/state'
import {EditorView} from '@codemirror/view'

/**
 * Thin wrapper around CodeMirror's linter extension that styles the lint marks
 * @param Linter LintSource that returns array of Diagnostic
 * @link https://codemirror.net/docs/ref/#lint.LintSource
 * @returns linter extension
 */
function customLinter(lintSource: LintSource): Extension[] {
  return [
    linter(lintSource),
    EditorView.editorAttributes.of({
      class: 'custom-tooltips',
    }),
  ]
}

export {customLinter as linter}
