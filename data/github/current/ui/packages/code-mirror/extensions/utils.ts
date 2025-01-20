import {Compartment, type Extension} from '@codemirror/state'
import {type EditorView, keymap} from '@codemirror/view'

/**
 * This function is used to create an extension that is toggleable by a key binding.
 * @param key The key to use to toggle the extension
 * @param extension The extension to toggle
 * @param initialState The initial state of the extension
 * @returns An extension array
 */
export function toggleWith(keyBinding: string, extension: Extension, initiallyEnabled: boolean): Extension[] {
  const initial = initiallyEnabled ? extension : []

  const privateCompartment = new Compartment()
  function toggle(view: EditorView) {
    const on = privateCompartment.get(view.state) === extension
    view.dispatch({
      effects: privateCompartment.reconfigure(on ? [] : extension),
    })
    return true
  }
  return [privateCompartment.of(initial), keymap.of([{key: keyBinding, run: toggle}])]
}
