import {RuleTester} from 'eslint'
import rule from '../package-json-version-numbers'

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
ruleTester.run('check-version-numbers', rule as any, {
  valid: [
    // Internal dependencies
    {
      code: `
        {
          "dependencies": {
            "@github-ui/foo": "*"
          },
          "devDependencies": {
            "@github-ui/bar": "*"
          }
        }
      `,
      filename: 'ui/packages/test/package.json',
    },
    // Managed dependencies
    {
      code: `
        {
          "dependencies": {
            "react": "*"
          },
          "devDependencies": {
            "@testing-library/react": "*"
          }
        }
      `,
      filename: 'ui/packages/test/package.json',
    },
    // Managed dependencies, in owning package
    {
      code: `
        {
          "dependencies": {
            "react": "18.0.0"
          },
          "devDependencies": {
            "@testing-library/react": "1.2.3"
          }
        }
      `,
      filename: 'ui/packages/react-core/package.json',
    },
    // Exempt dependencies
    {
      code: `
        {
          "dependencies": {
            "react": "19.0.0",
            "react-dom": "19.0.0"
          }
        }
      `,
      filename: 'ui/packages/react-next/package.json',
    },
  ],

  invalid: [
    // External dependencies
    {
      code: `
        {
          "dependencies": {
            "foo": "*"
          }
        }
        `,
      errors: [
        {
          message: 'Dependency "foo" in "dependencies" is an external dependency and needs a specific version number',
          type: 'Literal',
        },
      ],

      filename: 'ui/packages/test/package.json',
    },

    // Managed dependencies, in non-owning package
    {
      code: `
        {
          "dependencies": {
            "react": "18.0.0"
          }
        }
      `,
      output: `
        {
          "dependencies": {
            "react": "*"
          }
        }
      `,
      errors: [
        {
          message: 'Dependency "react" in "dependencies" should have version "*"',
          type: 'Literal',
        },
      ],
      filename: 'ui/packages/other/package.json',
    },

    // Managed dependencies, in owning package
    {
      code: `
        {
          "dependencies": {
            "react": "*"
          }
        }
      `,
      errors: [
        {
          message: 'Dependency "react" in "dependencies" is an external dependency and needs a specific version number',
          type: 'Literal',
        },
      ],
      filename: 'ui/packages/react-core/package.json',
    },

    // Internal dependencies
    {
      code: `
        {
          "devDependencies": {
            "@github-ui/foo": "18.0.0"
          }
        }
      `,
      output: `
        {
          "devDependencies": {
            "@github-ui/foo": "*"
          }
        }
      `,
      errors: [
        {
          message: 'Dependency "@github-ui/foo" in "devDependencies" should have version "*"',
          type: 'Literal',
        },
      ],
      filename: 'ui/packages/bar/package.json',
    },
  ],
})
