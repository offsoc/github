import rule from '../accessible-default-keybindings'
import {invalidTestCase, validTestCase} from './test-utils'
import {RuleTester} from 'eslint'

const TOO_MANY_KEYS_MESSAGE =
  'Keybinding is not accessible: Chords should consist of 4 or fewer physical keys being pressed simultaneously.'
const DEFAULT_OS_SHORTCUTS_MESSAGE =
  "Keybinding is not accessible: Don't override default operating system shortcuts which are commonly-used."
const STANDARD_NAVIGATION_MESSAGE =
  'Keybinding is not accessible: Do not override standard keyboard navigation using commands.'
const ALT_SINGLE_MODIFIER_MESSAGE = 'Keybinding is not accessible: Alt should not be the sole modifier in a keybinding.'
const FUNCTION_KEY_MESSAGE = 'Keybinding is not accessible: Function keys without modifiers are reserved by Windows.'
const SCREEN_READER_MESSAGE =
  'Keybinding is not accessible: Do not override common screen reader commands or use keys screen readers use as modifiers.'

new RuleTester().run('commands-json-accessible-default-keybindings', rule, {
  valid: [
    validTestCase('does not report chords with 4 or fewer keys', {keybinding: 'Mod+Alt+B'}),
    validTestCase('does not report chords with 4 or fewer keys in global scope', {
      keybinding: 'Mod+Alt+B',
    }),
    validTestCase('does not report permitted override of Mod+c', {
      keybinding: 'Mod+c',
      commandName: 'Copy',
      commandDescription: 'Copy line of code',
    }),
    validTestCase('does not report permitted override of Mod+a', {
      keybinding: 'Mod+a',
      commandName: 'Select all',
      commandDescription: 'Select all lines of code',
    }),
  ],
  invalid: [
    invalidTestCase('reports chords with over 4 keys', {
      keybinding: 'Control+Shift+Meta+B+G',
      errors: [TOO_MANY_KEYS_MESSAGE],
      fixOutput: null,
    }),
    invalidTestCase('reports keybindings with only Alt as the modifier', {
      keybinding: 'Alt+b',
      errors: [ALT_SINGLE_MODIFIER_MESSAGE],
      fixOutput: null,
    }),
    invalidTestCase('reports keybindings which try to override standard keyboard navigation', {
      keybinding: 'Tab',
      errors: [STANDARD_NAVIGATION_MESSAGE],
      fixOutput: null,
    }),
    invalidTestCase('reports keybindings which interfere with screen reader commands or modifiers', {
      keybinding: 'Shift+Insert',
      errors: [SCREEN_READER_MESSAGE],
      fixOutput: null,
    }),
    invalidTestCase('reports high-priority mod+c override that is not in the set of permitted behaviors', {
      keybinding: 'Mod+c',
      commandName: 'Go to line',
      commandDescription: 'Go to line of code',
      errors: [DEFAULT_OS_SHORTCUTS_MESSAGE],
      fixOutput: null,
    }),
    invalidTestCase('reports high-priority mod+c override in a global commands.json', {
      keybinding: 'Mod+c',
      commandName: 'Copy element',
      commandDescription: 'Copy the element for usage by developer',
      errors: [DEFAULT_OS_SHORTCUTS_MESSAGE],
      fixOutput: null,
      filenameOverride: 'ui/packages/ui-commands/commands.json',
    }),
    invalidTestCase('reports high priority mod+a override that is not in the set of permitted behaviors', {
      keybinding: 'Mod+a',
      commandName: 'Choose all',
      commandDescription: 'Highlights everything in the UI',
      errors: [DEFAULT_OS_SHORTCUTS_MESSAGE],
      fixOutput: null,
    }),
    invalidTestCase('reports 3-key chord high-priority OS keybinding overrides', {
      keybinding: 'Mod+Shift+H',
      errors: [DEFAULT_OS_SHORTCUTS_MESSAGE],
      fixOutput: null,
    }),
    invalidTestCase('reports single function keys', {
      keybinding: 'F5',
      errors: [FUNCTION_KEY_MESSAGE],
      fixOutput: null,
    }),
  ],
})
