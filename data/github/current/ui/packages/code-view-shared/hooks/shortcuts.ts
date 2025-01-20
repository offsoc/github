import {useClientValue} from '@github-ui/use-client-value'
import {useIsPlatform} from '@github-ui/use-is-platform'

//If you want a shortcut to work while the blob is focused, you need to set useWhileBlobFocused to true and also
//add the hotkey without any modifiers to the alphanumeric hotkey array
export interface Shortcut {
  text?: string
  hotkey?: string
  ariaKeyShortcuts?: string
  useWhileBlobFocused?: boolean
  noModifierHotkey?: string[]
  modifierRequired?: boolean
}

interface Shortcuts {
  cursorNavigationHopWordLeft: Shortcut
  cursorNavigationHopWordRight: Shortcut
  cursorNavigationTopOfPage: Shortcut
  cursorNavigationBottomOfPage: Shortcut
  alternativeGoToLineShortcut: Shortcut
  cursorNavigationEnd: Shortcut
  cursorNavigationHome: Shortcut
  cursorNavigationOpenHelpDialog: Shortcut
  expandAndFocusLineContextMenu: Shortcut
  cursorNavigationSpace: Shortcut
  cursorNavigationShiftSpace: Shortcut
  cursorNavigationPageUp: Shortcut
  cursorNavigationPageDown: Shortcut
  cursorNavigationArrowDown: Shortcut
  cursorNavigationArrowUp: Shortcut
  cursorNavigationArrowLeft: Shortcut
  cursorNavigationArrowRight: Shortcut
  cursorNavigationShiftHopWordLeft: Shortcut
  cursorNavigationShiftHopWordRight: Shortcut
  cursorNavigationShiftTopOfPage: Shortcut
  cursorNavigationShiftBottomOfPage: Shortcut
  cursorNavigationShiftEnd: Shortcut
  cursorNavigationShiftHome: Shortcut
  cursorNavigationShiftPageUp: Shortcut
  cursorNavigationShiftPageDown: Shortcut
  cursorNavigationShiftArrowDown: Shortcut
  cursorNavigationShiftArrowUp: Shortcut
  cursorNavigationShiftArrowLeft: Shortcut
  cursorNavigationShiftArrowRight: Shortcut
  cursorNavigationHighlightLine: Shortcut
  cursorNavigationGoLineUp: Shortcut
  cursorNavigationGoLineDown: Shortcut
  cursorNavigationEnter: Shortcut
  copyFilePathShortcut: Shortcut
  copyPermalinkShortcut: Shortcut
  copyRawContentShortcut: Shortcut
  downloadRawContentShortcut: Shortcut
  editFileShortcut: Shortcut
  goToLineShortcut: Shortcut
  escapeRightClickMenu: Shortcut
  findInFileShortcut: Shortcut
  findSelectionShortcut: Shortcut
  refSelectorShortcut: Shortcut
  findFilesShortcut: Shortcut
  findNextShortcut: Shortcut
  findPrevShortcut: Shortcut
  openWithGitHubDevShortcut: Shortcut
  openWithGitHubDevInNewWindowShortcut: Shortcut
  permalinkShortcut: Shortcut
  searchShortcut: Shortcut
  selectAllShortcut: Shortcut
  selectEditTabShortcut: Shortcut
  submitCommitDialogShortcut: Shortcut
  toggleFocusedPaneShortcut: Shortcut
  toggleSymbolsShortcut: Shortcut
  toggleTreeShortcut: Shortcut
  viewBlameShortcut: Shortcut
  viewCodeShortcut: Shortcut
  viewPreviewShortcut: Shortcut
  viewRawContentShortcut: Shortcut
  findSymbolShortcut: Shortcut
}

const macShortcuts: Shortcuts = {
  cursorNavigationHopWordLeft: {
    hotkey: 'Alt+ArrowLeft,Ctrl+ArrowLeft',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowLeft'],
    modifierRequired: true,
  },
  cursorNavigationHopWordRight: {
    hotkey: 'Alt+ArrowRight,Ctrl+ArrowRight',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowRight'],
    modifierRequired: true,
  },
  cursorNavigationTopOfPage: {
    hotkey: 'Meta+ArrowUp',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowUp'],
    modifierRequired: true,
  },
  cursorNavigationBottomOfPage: {
    hotkey: 'Meta+ArrowDown',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowDown'],
    modifierRequired: true,
  },
  cursorNavigationEnd: {
    hotkey: 'End,Meta+ArrowRight',
    useWhileBlobFocused: true,
    noModifierHotkey: ['End'],
  },
  cursorNavigationHome: {
    hotkey: 'Home,Meta+ArrowLeft',
    useWhileBlobFocused: true,
    noModifierHotkey: ['Home'],
  },
  cursorNavigationPageUp: {
    hotkey: 'PageUp',
    useWhileBlobFocused: true,
    noModifierHotkey: ['PageUp'],
  },
  cursorNavigationPageDown: {
    hotkey: 'PageDown',
    useWhileBlobFocused: true,
    noModifierHotkey: ['PageDown'],
  },
  cursorNavigationArrowDown: {
    hotkey: 'ArrowDown',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowDown'],
  },
  cursorNavigationArrowUp: {
    hotkey: 'ArrowUp',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowUp'],
  },
  cursorNavigationArrowLeft: {
    hotkey: 'ArrowLeft',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowLeft'],
  },
  cursorNavigationArrowRight: {
    hotkey: 'ArrowRight',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowRight'],
  },
  cursorNavigationShiftHopWordLeft: {
    hotkey: 'Alt+Shift+ArrowLeft,Ctrl+Shift+ArrowLeft',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowLeft'],
    modifierRequired: true,
  },
  cursorNavigationShiftHopWordRight: {
    hotkey: 'Alt+Shift+ArrowRight,Ctrl+Shift+ArrowRight',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowRight'],
    modifierRequired: true,
  },
  cursorNavigationShiftTopOfPage: {
    hotkey: 'Meta+Shift+ArrowUp',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowUp'],
    modifierRequired: true,
  },
  cursorNavigationShiftBottomOfPage: {
    hotkey: 'Meta+Shift+ArrowDown',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowDown'],
    modifierRequired: true,
  },
  cursorNavigationShiftEnd: {
    hotkey: 'Shift+End,Meta+Shift+ArrowRight',
    useWhileBlobFocused: true,
    noModifierHotkey: ['End'],
    modifierRequired: true,
  },
  cursorNavigationShiftHome: {
    hotkey: 'Shift+Home,Meta+Shift+ArrowLeft',
    useWhileBlobFocused: true,
    noModifierHotkey: ['Home'],
    modifierRequired: true,
  },
  cursorNavigationShiftPageUp: {
    hotkey: 'Shift+PageUp',
    useWhileBlobFocused: true,
    noModifierHotkey: ['PageUp'],
    modifierRequired: true,
  },
  cursorNavigationShiftPageDown: {
    hotkey: 'Shift+PageDown',
    useWhileBlobFocused: true,
    noModifierHotkey: ['PageDown'],
    modifierRequired: true,
  },
  cursorNavigationShiftArrowDown: {
    hotkey: 'Shift+ArrowDown',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowDown'],
    modifierRequired: true,
  },
  cursorNavigationShiftArrowUp: {
    hotkey: 'Shift+ArrowUp',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowUp'],
    modifierRequired: true,
  },
  cursorNavigationShiftArrowLeft: {
    hotkey: 'Shift+ArrowLeft',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowLeft'],
    modifierRequired: true,
  },
  cursorNavigationShiftArrowRight: {
    hotkey: 'Shift+ArrowRight',
    useWhileBlobFocused: true,
    noModifierHotkey: ['ArrowRight'],
    modifierRequired: true,
  },
  cursorNavigationHighlightLine: {
    text: 'J',
    hotkey: 'Shift+J',
    useWhileBlobFocused: true,
    noModifierHotkey: ['J'],
    modifierRequired: true,
  },
  cursorNavigationGoLineUp: {
    hotkey: 'Ctrl+p',
    useWhileBlobFocused: true,
    noModifierHotkey: ['p'],
    modifierRequired: true,
  },
  cursorNavigationOpenHelpDialog: {
    hotkey: 'Alt+F1,Control+Alt+˙,Control+Alt+h',
    useWhileBlobFocused: true,
    noModifierHotkey: ['F1', 'h', '˙'],
    modifierRequired: true,
  },
  cursorNavigationGoLineDown: {
    hotkey: 'Ctrl+n',
    useWhileBlobFocused: true,
    noModifierHotkey: ['n'],
    modifierRequired: true,
  },
  cursorNavigationEnter: {
    text: '⌘ Enter',
    hotkey: 'Meta+Enter',
    useWhileBlobFocused: true,
    noModifierHotkey: ['Enter'],
    modifierRequired: true,
  },
  cursorNavigationSpace: {
    hotkey: ' ',
    useWhileBlobFocused: true,
    noModifierHotkey: [' '],
    modifierRequired: false,
  },
  cursorNavigationShiftSpace: {
    hotkey: 'Shift+ ',
    useWhileBlobFocused: true,
    noModifierHotkey: [' '],
    modifierRequired: true,
  },
  expandAndFocusLineContextMenu: {
    text: 'Shift Alt C',
    hotkey: 'Alt+Shift+C,Alt+Shift+Ç',
    useWhileBlobFocused: true,
    noModifierHotkey: ['C'],
    modifierRequired: true,
  },
  copyFilePathShortcut: {
    text: '⌘ shift .',
    hotkey: 'Meta+Shift+>',
    useWhileBlobFocused: true,
    noModifierHotkey: ['.'],
    modifierRequired: true,
  },
  copyPermalinkShortcut: {
    text: '⌘ shift ,',
    hotkey: 'Meta+Shift+<',
    useWhileBlobFocused: true,
    noModifierHotkey: [','],
    modifierRequired: true,
  },
  copyRawContentShortcut: {
    text: '⌘ shift c',
    hotkey: 'Meta+Shift+C',
    useWhileBlobFocused: true,
    noModifierHotkey: ['c'],
    modifierRequired: true,
  },
  downloadRawContentShortcut: {
    text: '⌘ shift s',
    hotkey: 'Meta+Shift+S',
    useWhileBlobFocused: true,
    noModifierHotkey: ['s'],
    modifierRequired: true,
  },
  editFileShortcut: {
    hotkey: 'e,Shift+E',
    useWhileBlobFocused: true,
    noModifierHotkey: ['e', 'E'],
  },
  goToLineShortcut: {
    text: 'l',
    hotkey: 'l,Shift+L',
    ariaKeyShortcuts: 'l',
    useWhileBlobFocused: true,
    noModifierHotkey: ['l', 'L'],
  },
  alternativeGoToLineShortcut: {
    hotkey: 'Mod+Alt+g',
    ariaKeyShortcuts: 'Mod+Alt+g',
    useWhileBlobFocused: true,
    noModifierHotkey: ['g', 'G'],
  },
  findInFileShortcut: {
    hotkey: 'Meta+f, F3',
    text: '⌘ f',
    ariaKeyShortcuts: 'Meta+F',
    useWhileBlobFocused: true,
    noModifierHotkey: ['f', 'F3'],
    modifierRequired: true,
  },
  findFilesShortcut: {
    hotkey: 't,Shift+T',
    useWhileBlobFocused: true,
    noModifierHotkey: ['t', 'T'],
  },
  findSelectionShortcut: {
    hotkey: 'Meta+e',
    useWhileBlobFocused: true,
    noModifierHotkey: ['e'],
    modifierRequired: true,
  },
  findNextShortcut: {
    hotkey: 'Mod+g',
  },
  findPrevShortcut: {
    hotkey: 'Mod+Shift+G',
  },
  openWithGitHubDevShortcut: {
    hotkey: '., Meta+Shift+/',
    useWhileBlobFocused: true,
    noModifierHotkey: ['.'],
  },
  openWithGitHubDevInNewWindowShortcut: {
    hotkey: 'Shift+.,Shift+>,>',
    useWhileBlobFocused: true,
    noModifierHotkey: ['>'],
  },
  permalinkShortcut: {
    hotkey: 'y,Shift+Y',
    useWhileBlobFocused: true,
    noModifierHotkey: ['y', 'Y'],
  },
  searchShortcut: {
    hotkey: '/',
    useWhileBlobFocused: true,
    noModifierHotkey: ['/'],
  },
  selectAllShortcut: {
    hotkey: 'Meta+a',
    useWhileBlobFocused: true,
    noModifierHotkey: ['a'],
    modifierRequired: true,
  },
  selectEditTabShortcut: {
    hotkey: 'Mod+Shift+P',
  },
  submitCommitDialogShortcut: {
    hotkey: 'Mod+Enter',
  },
  refSelectorShortcut: {
    hotkey: 'w',
    text: 'w',
    useWhileBlobFocused: true,
    noModifierHotkey: ['w'],
  },
  escapeRightClickMenu: {
    hotkey: 'Escape',
    useWhileBlobFocused: true,
    noModifierHotkey: ['Escape'],
  },
  toggleFocusedPaneShortcut: {
    // we don't need a separate command to go backwards because there's only two options (for now)
    hotkey: 'Meta+F6,Meta+Shift+F6',
    useWhileBlobFocused: true,
    noModifierHotkey: ['F6'],
    modifierRequired: true,
  },
  toggleSymbolsShortcut: {
    hotkey: 'Meta+i',
    useWhileBlobFocused: true,
    noModifierHotkey: ['i'],
    modifierRequired: true,
  },
  toggleTreeShortcut: {
    hotkey: 'Meta+b',
    useWhileBlobFocused: true,
    noModifierHotkey: ['b'],
    modifierRequired: true,
  },
  viewBlameShortcut: {
    hotkey: 'b,Shift+B,Meta+/ Meta+b',
    useWhileBlobFocused: true,
    noModifierHotkey: ['b'],
  },
  viewCodeShortcut: {
    hotkey: 'Meta+/ Meta+c',
    useWhileBlobFocused: true,
    modifierRequired: true,
  },
  viewPreviewShortcut: {
    hotkey: 'Meta+/ Meta+p',
  },
  viewRawContentShortcut: {
    text: '⌘ / ⌘ r',
    hotkey: 'Meta+/ Meta+r',
    useWhileBlobFocused: true,
    noModifierHotkey: ['r'],
    modifierRequired: true,
  },
  findSymbolShortcut: {
    hotkey: 'r,Shift+R',
    useWhileBlobFocused: true,
    noModifierHotkey: ['r', 'R'],
    modifierRequired: false,
  },
}

function modifyForNonMac(shortcuts: Shortcuts): Shortcuts {
  return Object.keys(shortcuts).reduce((acc, key) => {
    const shortcut = shortcuts[key as keyof Shortcuts]
    acc[key as keyof Shortcuts] = {
      hotkey: shortcut.hotkey?.replace(/Meta/g, 'Control'),
      text: shortcut.text?.replace(/⌘/g, 'Ctrl').replace(/⇧/g, 'Shift'),
      ariaKeyShortcuts: shortcut.ariaKeyShortcuts?.replace(/Meta/g, 'Control'),
      useWhileBlobFocused: shortcut.useWhileBlobFocused,
      modifierRequired: shortcut.modifierRequired,
      noModifierHotkey: shortcut.noModifierHotkey,
    }
    return acc
  }, {} as Shortcuts)
}
/***
This function is necessary in SSR because the data-hotkey attribute does not
recognize changes to hotkeys that happen during hydration. So we needed the
data-hotkey attribute to not exist until during hydration. We had
the useClientValue returning false on whether or not the user was using a mac,
so all hotkeys were being changed to have control in them instead of meta.
This was causing mac users to not be able to use any hotkeys that had Meta
in them if they got the SSR'd version of the blob page.
***/
function modifyForSSR(shortcuts: Shortcuts): Shortcuts {
  return Object.keys(shortcuts).reduce((acc, key) => {
    const shortcut = shortcuts[key as keyof Shortcuts]
    acc[key as keyof Shortcuts] = {
      hotkey: undefined,
      text: shortcut.text?.replace(/⌘/g, 'Ctrl').replace(/⇧/g, 'Shift'),
      ariaKeyShortcuts: shortcut.ariaKeyShortcuts?.replace(/Meta/g, 'Control'),
      useWhileBlobFocused: shortcut.useWhileBlobFocused,
      modifierRequired: shortcut.modifierRequired,
      noModifierHotkey: shortcut.noModifierHotkey,
    }
    return acc
  }, {} as Shortcuts)
}

// Memo this result globally to avoid running this transformation function for each component
// isMac -> shortcuts
const shortcutMemo: Map<number, Shortcuts> = new Map()

export function useShortcut(): Shortcuts {
  const isMac = useIsPlatform(['mac'])
  const [isSSR] = useClientValue(() => false, true, [])
  //we want the modification scripts to run again whether isMac changes from the default false value OR the SSR value
  //changes from the default value of true.
  let key = 0
  if (isMac) {
    key = 1
  } else if (!isSSR) {
    key = 2
  }

  if (!shortcutMemo.has(key)) {
    let shortcuts = macShortcuts

    if (!isMac && !isSSR) {
      shortcuts = modifyForNonMac(shortcuts)
    }
    if (isSSR) {
      shortcuts = modifyForSSR(shortcuts)
    }

    shortcutMemo.set(key, shortcuts)
  }

  return shortcutMemo.get(key) as Shortcuts
}
export function useBlobFocusedModifierShortcuts(): string[] {
  const shortcuts = useShortcut()
  return Object.keys(shortcuts).reduce((acc, key) => {
    const shortcut = shortcuts[key as keyof Shortcuts]
    if (shortcut.useWhileBlobFocused && shortcut.noModifierHotkey && shortcut.modifierRequired) {
      for (const alphaNumericHotkey of shortcut.noModifierHotkey) {
        if (!acc.includes(alphaNumericHotkey)) {
          acc.push(alphaNumericHotkey)
        }
      }
    }
    return acc
  }, [] as string[])
}
export function useBlobFocusedShortcuts(): string[] {
  const shortcuts = useShortcut()
  return Object.keys(shortcuts).reduce((acc, key) => {
    const shortcut = shortcuts[key as keyof Shortcuts]
    if (shortcut.useWhileBlobFocused && shortcut.noModifierHotkey && !shortcut.modifierRequired) {
      for (const alphaNumericHotkey of shortcut.noModifierHotkey) {
        if (!acc.includes(alphaNumericHotkey)) {
          acc.push(alphaNumericHotkey)
        }
      }
    }
    return acc
  }, [] as string[])
}
