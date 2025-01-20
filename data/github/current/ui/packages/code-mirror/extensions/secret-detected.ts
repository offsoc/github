import type {Extension} from '@codemirror/state'
import {EditorView} from '@codemirror/view'
import {posToOffset} from '../utils'
import type {SecretDetectedLintEventDetail, SecretDetectedEvents} from '../types/custom-events'
import {addLintMark, lintMarkField} from '../decorations/lint-mark'

const handleSecretLint = (event: Event, view: EditorView) => {
  const customEvent = event as CustomEvent<SecretDetectedLintEventDetail>
  const {from, to, severity} = customEvent.detail

  const fromOffset = posToOffset(view, {line: from.lineNumber, ch: from.character})
  const toOffset = posToOffset(view, {line: to.lineNumber, ch: to.character})

  view.dispatch({
    effects: [addLintMark.of({from: fromOffset, to: toOffset, severity})],
  })
}

type EventHandlers = {
  [key in SecretDetectedEvents]: (event: Event, view: EditorView) => void
}

export function secretDetectedListener(): Extension {
  const eventHandlers: EventHandlers = {
    'secret-detected:lint': handleSecretLint,
  }

  return [EditorView.domEventHandlers(eventHandlers), lintMarkField]
}
