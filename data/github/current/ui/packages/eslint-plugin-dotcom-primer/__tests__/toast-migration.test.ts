import {RuleTester} from 'eslint'

import rule from '../rules/toast-migration'

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
})

const error =
  'Toasts degrade the overall user experience and are therefore considered a discouraged pattern. Please consider using alternatives as described in: https://primer.style/ui-patterns/notification-messaging. If you have any questions, reach out in #primer.'

ruleTester.run('toast-migration', rule, {
  valid: [{code: `notAToast()`}],
  invalid: [
    {
      code: `something.addToast()`,
      errors: [error],
    },
    {
      code: `something.addPersistedToast()`,
      errors: [error],
    },
    {
      code: `addToast()`,
      errors: [error],
    },
    {
      code: `addPersistedToast()`,
      errors: [error],
    },
  ],
})
