import {defaultKeymap, history, historyKeymap} from '@codemirror/commands'
import {search, searchKeymap} from '@codemirror/search'
import type {Extension} from '@codemirror/state'
import {EditorView, type KeyBinding, keymap, lineNumbers, tooltips} from '@codemirror/view'
import {bracketMatching, indentOnInput} from '@codemirror/language'
import {areCharacterKeyShortcutsEnabled} from '@github-ui/hotkey/keyboard-shortcuts-helper'

// instead of trying to find and delete specific keymaps, we're going to catch them, mark them handled, and prevent them from bubbling
const specialCharacterKeyShortcuts: KeyBinding[] = (() => {
  if (!areCharacterKeyShortcutsEnabled()) {
    // We treat `Alt+G` as a character key shortcut because it is equivalent to a special character.
    return [
      {
        key: 'Alt-g',
        run: () => {
          return true
        },
        preventDefault: true, // dont bubble up
      },
    ]
  }

  return []
})()

export const basicSetup: Extension[] = (() => [
  history(),
  indentOnInput(),
  lineNumbers(),
  bracketMatching(),
  tooltips({position: 'absolute'}),
  search({top: true}),
  EditorView.editorAttributes.of({
    class: 'js-codemirror-editor',
    'data-testid': 'codemirror-editor',
  }),
  keymap.of([...specialCharacterKeyShortcuts, ...defaultKeymap, ...searchKeymap, ...historyKeymap]),
])()
