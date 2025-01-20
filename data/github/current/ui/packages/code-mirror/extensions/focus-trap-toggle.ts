import {indentLess, indentMore} from '@codemirror/commands'
import {indentUnit} from '@codemirror/language'
import type {Extension, StateCommand} from '@codemirror/state'
import {type KeyBinding, keymap} from '@codemirror/view'
import {toggleWith} from './utils'
import {helpPanelConstructor} from './help-panels'

export const insertIndent: StateCommand = ({state, dispatch}) => {
  if (state.selection.ranges.some(r => !r.empty)) return indentMore({state, dispatch})
  dispatch(state.update(state.replaceSelection(state.facet(indentUnit)), {scrollIntoView: true, userEvent: 'input'}))
  return true
}

// this keymap prevents the editor from losing focus when tab is pressed
const indentWithTab: KeyBinding = {key: 'Tab', run: insertIndent, shift: indentLess}

export function focusTrapToggle(): Extension {
  // by default, pressing tab will insert an indent
  // pressing Shift-Ctrl-m will toggle the focus trap and allow tab to be used for navigation
  // pressing Shift-Ctrl-m again will toggle the focus trap back on
  return [toggleWith('Shift-Ctrl-m', keymap.of([indentWithTab]), true), helpPanelConstructor(focusTrapHelpPanel())]
}

function focusTrapHelpPanel() {
  const dom = document.createElement('div')

  const createKbdElement = (key: string) => {
    const kbd = document.createElement('kbd')
    kbd.textContent = key
    return kbd
  }

  // manually create the dom for the help text to avoid unnecessary dependencies (ie- lit-html)
  dom.append(
    'Use ',
    createKbdElement(`Control + Shift + m`),
    ' to toggle the ',
    createKbdElement('tab'),
    ' key moving focus. Alternatively, use ',
    createKbdElement('esc'),
    ' then ',
    createKbdElement('tab'),
    ' to move to the next interactive element on the page.',
  )

  dom.className = 'cm-help-panel'
  dom.id = 'focus-trap-help-panel'
  return dom
}
