import {RuleTester} from 'eslint'
import rule from '../test-file-names'

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
})

ruleTester.run('test-file-names', rule, {
  valid: [
    // Proper test file name with `.ts`
    {
      code: `
        describe('some-description', () => {
          test('some-test', () => {})
        })
      `,
      filename: 'ui/packages/test/__test__/some-description.test.ts',
    },
    // Proper test file name with `.tsx`
    {
      code: `
        describe('some-description', () => {
          test('some-test', () => {})
        })
      `,
      filename: 'ui/packages/test/__test__/some-description.test.tsx',
    },
  ],

  invalid: [
    // Typo'd test file
    {
      code: `
      describe('some-description', () => {
        test('some-test', () => {})
      })
        `,
      errors: [
        {
          message: 'Jest test files should have a .test.ts or .test.tsx suffix.',
        },
        {
          message: 'Jest test files should have a .test.ts or .test.tsx suffix.',
        },
      ],

      filename: 'ui/packages/test/__test__/some-description.1test.ts',
    },
    // non test file
    {
      code: `
      describe('some-description', () => {
        test('some-test', () => {})
      })
        `,
      errors: [
        {
          message: 'Jest test files should have a .test.ts or .test.tsx suffix.',
        },
        {
          message: 'Jest test files should have a .test.ts or .test.tsx suffix.',
        },
      ],

      filename: 'ui/packages/test/__test__/some-description.ts',
    },
  ],
})
