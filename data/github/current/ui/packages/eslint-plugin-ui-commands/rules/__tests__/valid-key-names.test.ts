import {RuleTester} from 'eslint'
import rule from '../valid-key-names'
import {invalidTestCase, validTestCase} from './test-utils'

new RuleTester().run('valid-key-names', rule, {
  valid: [
    validTestCase('does not report valid keybindings', {keybinding: 'Shift+A'}),
    validTestCase('does not report dead keys when Shift is a modifier', {
      keybinding: 'Alt+Shift+N',
    }),
  ],
  invalid: [
    invalidTestCase('reports keybindings using Option with hint for Alt', {
      keybinding: 'Option+p',
      errors: ["Unknown key name 'Option': the correct name of the MacOS 'Option' modifier key is 'Alt'."],
      fixOutput: 'Alt+p',
    }),
    invalidTestCase('reports keybindings using Command with hint for Meta', {
      keybinding: 'Cmd+p',
      errors: ["Unknown key name 'Cmd': the correct name of the MacOS 'Command' modifier key is 'Meta'."],
      fixOutput: 'Meta+p',
    }),
    invalidTestCase('reports keybindings using Esc with hint for Escape', {
      keybinding: 'Esc',
      errors: ["Unknown key name 'Esc': use the full name of the 'Escape' key."],
      fixOutput: 'Escape',
    }),
    invalidTestCase('reports unknown key names', {
      keybinding: 'xyz',
      errors: ["Unknown key name 'xyz'."],
      fixOutput: null,
    }),
    invalidTestCase('reports incorrectly cased key names', {
      keybinding: 'pageup',
      errors: ["Key names are case-sensitive: use 'PageUp' instead of 'pageup'."],
      fixOutput: 'PageUp',
    }),
    invalidTestCase('reports unknown character keys', {
      keybinding: 'ß',
      errors: ["Unknown key name 'ß'. Character keys must be present on a US English QWERTY layout."],
      fixOutput: null,
    }),
    invalidTestCase('reports incorrectly lowercased key names when Shift is a modifier', {
      keybinding: 'Shift+a',
      errors: ["When 'Shift' is a modifier, the target key must be uppercase."],
      fixOutput: 'Shift+A',
    }),
    invalidTestCase('reports incorrectly uppercased key names when Shift is a modifier along with Mod', {
      keybinding: 'Mod+Shift+a',
      errors: ["When 'Shift' is a modifier, the target key must be uppercase."],
      fixOutput: 'Mod+Shift+A',
    }),
    invalidTestCase('reports incorrectly uppercased key names when Shift is not a modifier', {
      keybinding: 'A',
      errors: ["The target key must be lowercase unless 'Shift' is a modifier."],
      fixOutput: 'a',
    }),
    invalidTestCase('reports dead keys', {
      keybinding: 'Alt+n',
      errors: [
        "'Alt+`', 'Alt+e', 'Alt+u', 'Alt+i', 'Alt+n' produce 'Dead' keys (https://en.wikipedia.org/wiki/Dead_key) and cannot be used as shortcuts.",
      ],
      fixOutput: null,
    }),
    invalidTestCase('reports dead keys with additional modifiers', {
      keybinding: 'Mod+Alt+n',
      errors: [
        "'Alt+`', 'Alt+e', 'Alt+u', 'Alt+i', 'Alt+n' produce 'Dead' keys (https://en.wikipedia.org/wiki/Dead_key) and cannot be used as shortcuts.",
      ],
      fixOutput: null,
    }),
  ],
})
