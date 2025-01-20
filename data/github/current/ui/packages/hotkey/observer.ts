import {areCharacterKeyShortcutsEnabled, isNonCharacterKeyShortcut} from './keyboard-shortcuts-helper'
import {install, splitHotkeyString, uninstall} from './hotkey'
import {observe} from '@github/selector-observer'

export function observeHotkey(selector: string) {
  observe(selector, {
    constructor: HTMLElement,
    add(element) {
      // Disable character key shortcuts based on user preference
      if (areCharacterKeyShortcutsEnabled()) {
        install(element)
      } else {
        const shortcut = element.getAttribute('data-hotkey')
        if (shortcut) {
          const validShortcuts = filterOutCharacterKeyShortcuts(shortcut)
          if (validShortcuts.length > 0) {
            element.setAttribute('data-hotkey', validShortcuts)
            install(element)
          } else {
            element.removeAttribute('data-hotkey')
            uninstall(element)
          }
        }
      }
    },
    remove(element) {
      uninstall(element)
    },
  })
}

// This function keeps non-character key shortcuts and filters out character key shortcuts.
// See `isNonCharacterKeyShortcut` for more information.
export function filterOutCharacterKeyShortcuts(string: string) {
  const shortcuts = splitHotkeyString(string)
  return shortcuts
    .filter((s: string) => {
      return isNonCharacterKeyShortcut(s)
    })
    .join(',')
}
