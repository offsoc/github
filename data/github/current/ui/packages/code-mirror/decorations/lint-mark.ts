import {StateField, StateEffect} from '@codemirror/state'
import {EditorView, Decoration, type DecorationSet} from '@codemirror/view'

export type LintMarkSeverity = 'info' | 'warning' | 'error'

interface AddLintMark {
  from: number
  to: number
  severity: LintMarkSeverity
}

export const addLintMark = StateEffect.define<AddLintMark>({
  map: ({from, to, severity}, change) => ({from: change.mapPos(from), to: change.mapPos(to), severity}),
})

export const lintMarkField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(lintMarks, tr) {
    lintMarks = lintMarks.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(addLintMark)) {
        if (e.value.severity === 'error') {
          lintMarks = lintMarks.update({
            add: [lintMarkError.range(e.value.from, e.value.to)],
          })
        } else if (e.value.severity === 'warning') {
          lintMarks = lintMarks.update({
            add: [lintMarkWarning.range(e.value.from, e.value.to)],
          })
        } else if (e.value.severity === 'info') {
          lintMarks = lintMarks.update({
            add: [lintMarkInfo.range(e.value.from, e.value.to)],
          })
        }
      }
    }
    return lintMarks
  },
  provide: f => EditorView.decorations.from(f),
})

const lintMarkError = Decoration.mark({class: 'CodeMirror-lint-mark-error'})
const lintMarkWarning = Decoration.mark({class: 'CodeMirror-lint-mark-warning'})
const lintMarkInfo = Decoration.mark({class: 'CodeMirror-lint-mark-info'})
