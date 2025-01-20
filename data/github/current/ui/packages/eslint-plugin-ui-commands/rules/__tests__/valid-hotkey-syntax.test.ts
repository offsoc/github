import {RuleTester} from 'eslint'
import rule from '../valid-hotkey-syntax'
import {invalidTestCase, validTestCase} from './test-utils'

new RuleTester().run('valid-hotkey-syntax', rule, {
  valid: [validTestCase('does not report valid chords', {keybinding: 'Mod+Shift+p'})],
  invalid: [
    invalidTestCase('reports keybindings with empty chords', {
      keybinding: 'a  b',
      errors: ["Keybindings cannot contain empty chords (use 'Space' to represent the ' ' key)."],
      fixOutput: 'a b',
    }),
    invalidTestCase('reports chords with empty keys', {
      keybinding: 'Mod++b',
      errors: [
        "Chords cannot contain empty keys (use 'Plus' to represent the '+' key, and 'Space' to represent the ' ' key).",
      ],
      fixOutput: 'Mod+b',
    }),
    invalidTestCase('reports chords with duplicate keys', {
      keybinding: 'Mod+Mod+b',
      errors: ['Chords cannot contain duplicate keys.'],
      fixOutput: 'Mod+b',
    }),
    invalidTestCase('reports chords with modifiers in wrong order', {
      keybinding: 'Shift+Mod+P',
      errors: ["Keys in chord 'Shift+Mod+P' are not in standard order: expected 'Mod+Shift+P'."],
      fixOutput: 'Mod+Shift+P',
    }),
    invalidTestCase('reports keybindings with no target keys', {
      keybinding: 'Mod',
      errors: ['Exactly one non-modifier key is required in a chord.'],
      fixOutput: null,
    }),
    invalidTestCase('reports keybindings with multiple target keys', {
      keybinding: 'Mod+a+b',
      errors: ['Exactly one non-modifier key is required in a chord.'],
      fixOutput: null,
    }),
    invalidTestCase('reports both order and multiple-target errors at once', {
      keybinding: 'Shift+Mod+P+B',
      errors: [
        "Keys in chord 'Shift+Mod+P+B' are not in standard order: expected 'Mod+Shift+P+B'.",
        'Exactly one non-modifier key is required in a chord.',
      ],
      fixOutput: 'Mod+Shift+P+B',
    }),
  ],
})
