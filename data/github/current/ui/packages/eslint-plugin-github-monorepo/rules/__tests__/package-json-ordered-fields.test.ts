import {RuleTester} from 'eslint'
import rule from '../package-json-ordered-fields'

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
})

ruleTester.run('check-ordered-fields', rule, {
  // tests that use the check ordered fields rule to valid package.json exports
  valid: [
    {
      code: `
{
  "exports": {
    "./alloy-handler": "./file.tsx"
  }
}`,
      filename: 'ui/packages/test/package.json',
    },
    {
      code: `
{
  "exports": {
    "./alloy-handler": "./file.tsx",
    "./ReactAppElement": "./file.tsx"
  }
}`,
      filename: 'ui/packages/test/package.json',
    },
  ],
  invalid: [
    {
      code: `
{
  "exports": {
    "./ReactAppElement": "./file.tsx",
    "./alloy-handler": "./file.tsx"
  }
}`,
      filename: 'ui/packages/test/package.json',
      errors: [
        {
          message: 'Field "exports" must be sorted alphabetically',
        },
      ],
      output: `
{
  "exports": {
    "./alloy-handler": "./file.tsx",
    "./ReactAppElement": "./file.tsx"
  }
}`,
    },
  ],
})
