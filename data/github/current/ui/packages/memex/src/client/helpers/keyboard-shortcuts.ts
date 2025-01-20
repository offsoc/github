import {isMacOS} from '@github-ui/get-os'

const platformMeta = isMacOS() ? 'Meta' : 'Ctrl'

// Enums do not support computed string values
export const SHORTCUTS = {
  ARCHIVE: 'e',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  BACKSPACE: 'Backspace',
  CTRL_J: 'Ctrl+j',
  CTRL_K: 'Ctrl+k',
  CTRL_SPACE: 'Ctrl+ ',
  DELETE: 'Delete',
  END: 'End',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  HOME: 'Home',
  META_A: `${platformMeta}+a`,
  META_C: `${platformMeta}+c`,
  META_V: `${platformMeta}+v`,
  META_D: `${platformMeta}+d`,
  META_Z: `${platformMeta}+z`,
  META_ARROW_DOWN: `${platformMeta}+ArrowDown`,
  META_ARROW_LEFT: `${platformMeta}+ArrowLeft`,
  META_ARROW_RIGHT: `${platformMeta}+ArrowRight`,
  META_ARROW_UP: `${platformMeta}+ArrowUp`,
  META_END: `${platformMeta}+End`,
  META_SHIFT_F: `${platformMeta}+Shift+f`,
  META_F: `${platformMeta}+f`,
  META_HOME: `${platformMeta}+Home`,
  META_K: `${platformMeta}+k`,
  META_ENTER: `${platformMeta}+Enter`,
  META_SPACE: `${platformMeta}+ `,
  META_SLASH: `${platformMeta}+/`,
  SHIFT_ARROW_DOWN: 'Shift+ArrowDown',
  SHIFT_ARROW_UP: 'Shift+ArrowUp',
  SHIFT_SPACE: 'Shift+ ',
  SHIFT_TAB: 'Shift+Tab',
  SHIFT_ENTER: 'Shift+Enter',
  META_SHIFT_ENTER: `${platformMeta}+Shift+Enter`,
  SPACE: ' ',
  TAB: 'Tab',
  META_F6: `${platformMeta}+F6`,
}

const CHARACTERKEYSHORTCUTS = [SHORTCUTS.ARCHIVE, SHORTCUTS.SHIFT_SPACE]

let cachedKeyboardShortcutPreference: string | undefined = undefined

/** Returns true if the user has disabled the character key shortcuts (https://github.com/github/accessibility/discussions/221#discussioncomment-1450537) */
export const areCharacterKeyShortcutsDisabled = (): boolean => {
  if (!cachedKeyboardShortcutPreference) {
    const element = document.querySelector<HTMLMetaElement>('meta[name=keyboard-shortcuts-preference]')
    // this preference is only included for logged-in users
    // when this is omitted, assume 'all' is the default value
    cachedKeyboardShortcutPreference = element ? element.content : 'all'
  }

  return cachedKeyboardShortcutPreference === 'no_character_key'
}

export const shortcutFromEvent = (e: KeyboardEvent | React.KeyboardEvent) => {
  let str = ''

  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (e.ctrlKey) str += 'Ctrl+'
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (e.metaKey) str += 'Meta+'
  if (e.shiftKey) str += 'Shift+'

  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  str += e.key

  if (areCharacterKeyShortcutsDisabled() && CHARACTERKEYSHORTCUTS.includes(str)) return ''

  return str
}

export const FilterBarShortcut = SHORTCUTS.META_SLASH
