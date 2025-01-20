import {eventToHotkeyString} from './hotkey'

/** Returns false if a user has explicitly disabled character key shortcuts. */
export const areCharacterKeyShortcutsEnabled = () => {
  const keyboardShortcutsPreference = document.querySelector<HTMLMetaElement>(
    'meta[name=keyboard-shortcuts-preference]',
  )
  if (keyboardShortcutsPreference) {
    return keyboardShortcutsPreference.content === 'all'
  }
  return true
}

/**
 * Character-key shortcuts are implemented only with lowercase characters ("g", "g f"), uppercase characters ("Shift+A", "a"),
 * symbols ("Alt+g"), and punctuation ("?", "!", "/").
 *
 * Returns true if string is NOT what we define as a character key shortcut.
 */
export const isNonCharacterKeyShortcut = (hotkey: string) => {
  return /Enter|Arrow|Escape|Meta|Control|Mod|Esc/.test(hotkey) || (hotkey.includes('Alt') && hotkey.includes('Shift'))
}

const nonEditableInputTypes = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/**
 * Returns true if `element` is editable - that is, if it can be focused and typed in like an input or textarea.
 */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  const name = target.nodeName.toLowerCase()
  const type = target.getAttribute('type')?.toLowerCase() ?? 'text'

  const isReadonly =
    target.ariaReadOnly === 'true' ||
    target.getAttribute('aria-readonly') === 'true' ||
    target.getAttribute('readonly') !== null

  return (
    (name === 'select' ||
      name === 'textarea' ||
      (name === 'input' && !nonEditableInputTypes.has(type)) ||
      target.isContentEditable) &&
    !isReadonly
  )
}

/**
 * Returns false if a user settings has character key shortcut disabled and keyboard event corresponds to a character
 * key shortcut. Character key shortcuts are never enabled on editable form inputs.
 */
export const isShortcutAllowed = (event: KeyboardEvent) => {
  const hotkey = eventToHotkeyString(event)

  // Never allow character key shortcuts in inputs
  const allowCharacterKeyShortcuts = areCharacterKeyShortcutsEnabled() && !isEditableElement(event.target)

  return isNonCharacterKeyShortcut(hotkey) || allowCharacterKeyShortcuts
}
