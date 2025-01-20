import rule from '../require-mod'
import {invalidTestCase, validTestCase} from './test-utils'
import {RuleTester} from 'eslint'

new RuleTester().run('require-mod', rule, {
  valid: [validTestCase('Does not report keybindings using Mod', {keybinding: 'Mod+Shift+P'})],
  invalid: [
    invalidTestCase('reports keybindings using Control', {
      keybinding: 'Control+Shift+P',
      errors: ["Use 'Mod' instead of 'Control' or 'Meta' in keybindings."],
      fixOutput: 'Mod+Shift+P',
    }),
    invalidTestCase('reports keybindings using Meta', {
      keybinding: 'Meta+Shift+P',
      errors: ["Use 'Mod' instead of 'Control' or 'Meta' in keybindings."],
      fixOutput: 'Mod+Shift+P',
    }),
    invalidTestCase('double-reports keybindings using both', {
      keybinding: 'Control+Meta+P',
      errors: [
        "Use 'Mod' instead of 'Control' or 'Meta' in keybindings.",
        "Use 'Mod' instead of 'Control' or 'Meta' in keybindings.",
      ],
      fixOutput: 'Mod+Meta+P',
    }),
  ],
})
