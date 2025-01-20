import rule from '../no-manual-shortcut-logic'
import {parser} from './test-utils'
import {RuleTester} from 'eslint'

const filename = 'ui/packages/test-package/some-logic.ts'

const message = 'Prefer using the `@github-ui/ui-commands` platform instead of manual shortcut logic'

new RuleTester().run('prefer-ui-commands', rule, {
  valid: [
    {
      name: 'Accessing allowed properties',
      code: 'event.target;',
      filename,
      parser,
    },
    {
      name: 'Accessing `key` on non-event',
      code: 'blob.key;',
      filename,
      parser,
    },
  ],
  invalid: [
    {
      name: '`event.key` in ui-packages code',
      code: 'event.key;',
      filename,
      parser,
      errors: [{message}],
      output: null,
    },
    {
      name: '`event.key` in react-shared code',
      code: 'event.key;',
      filename: 'app/assets/modules/react-shared/logic.ts',
      parser,
      errors: [{message}],
      output: null,
    },
    {
      name: '`event.key` in non-React UI code',
      code: 'event.key;',
      filename: 'index.js',
      parser,
      errors: [{message: 'Prefer using data-hotkey instead of manual shortcut logic'}],
      output: null,
    },
    {
      name: '`event.ctrlKey`',
      code: 'event.ctrlKey;',
      filename,
      parser,
      errors: [{message}],
      output: null,
    },
    {
      name: 'Accessing `key` on event named `e`',
      code: 'e.key;',
      filename,
      parser,
      errors: [{message}],
      output: null,
    },
  ],
})
