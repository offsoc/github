import {
  type CompletionContext,
  type CompletionResult,
  acceptCompletion,
  autocompletion,
  closeCompletion,
  moveCompletionSelection,
  startCompletion,
} from '@codemirror/autocomplete'
import {Prec} from '@codemirror/state'
import {type KeyBinding, keymap} from '@codemirror/view'
import {autocompleteTheme} from './theme'

/**
 * Thin wrapper to create a custom, themed autocomplete extension
 * @param completionSource function that returns a promise of a CompletionResult
 * @param keymaps optional keybindings to override the default Tab keybinding
 * @param overrideEnterKey optional boolean to override the default Enter keybinding
 * @returns autocomplete extension
 * @link https://codemirror.net/docs/ref/#autocomplete
 */
function customAutocomplete(
  completionSource: (context: CompletionContext) => Promise<CompletionResult | null>,
  keymaps: KeyBinding[] = [{key: 'Tab', run: acceptCompletion}],
  overrideEnterKey = false,
) {
  return [
    autocompleteTheme,
    autocompletion({
      override: [completionSource],
      icons: false,
      defaultKeymap: !overrideEnterKey,
    }),
    Prec.highest(keymap.of(overrideEnterKey ? defaultKeymapWithoutEnter : [])),
    Prec.highest(keymap.of(keymaps)),
  ]
}

const defaultKeymapWithoutEnter: readonly KeyBinding[] = [
  {key: 'Ctrl-Space', run: startCompletion},
  {key: 'Escape', run: closeCompletion},
  {key: 'ArrowDown', run: moveCompletionSelection(true)},
  {key: 'ArrowUp', run: moveCompletionSelection(false)},
  {key: 'PageDown', run: moveCompletionSelection(true, 'page')},
  {key: 'PageUp', run: moveCompletionSelection(false, 'page')},
]

export {customAutocomplete as autocomplete}
