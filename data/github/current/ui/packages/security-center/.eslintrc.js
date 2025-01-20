const tsNamingConventionRuleOptions = [
  {
    selector: 'default',
    format: ['camelCase'],
  },
  {
    selector: ['typeLike', 'enumMember'],
    format: ['PascalCase'],
    custom: {
      // Must contain at least one lowercase letter to avoid all caps single words which apparently satisfy PascalCase
      // e.g. interface MYINTERFACE { }
      regex: '(^[A-Z]{1,2}$|[a-z])',
      match: true,
    },
  },
  {
    selector: 'variable',
    modifiers: ['const'],
    format: ['camelCase', 'UPPER_CASE'],
  },
  {
    selector: ['objectLiteralProperty'],
    format: null,
    modifiers: ['requiresQuotes'],
  },
  {
    // Enforces camel case for object literal properties with a key
    // e.g. ?myParam[myKey]=myValue
    selector: ['objectLiteralProperty'],
    format: null,
    modifiers: ['requiresQuotes'],
    filter: '\\[.*\\]$',
    custom: {
      regex: '^[a-z0-9][a-zA-Z0-9]*\\[[a-z0-9][a-zA-Z0-9]*\\]$',
      match: true,
    },
  },
  {
    // For example: (_unused: string) => { ... }
    selector: 'parameter',
    modifiers: ['unused'],
    format: ['camelCase'],
    leadingUnderscore: 'require',
  },
  {
    // Needed to allow for React functional components, which use PascalCase
    // e.g. registerReactPartial('my-component', { Component: MyComponent })
    selector: ['objectLiteralProperty'],
    types: ['function'],
    format: ['camelCase', 'PascalCase'],
    custom: {
      // Must contain at least one lowercase letter to avoid all caps single words which apparently satisfy PascalCase
      // e.g. { COMPONENT: MyComponent }
      regex: '(^[A-Z]{1,2}$|[a-z])',
      match: true,
    },
  },
]

const tsNamingConventionRules = {
  camelcase: 'off',
  '@typescript-eslint/naming-convention': ['error', ...tsNamingConventionRuleOptions],
}

const reactNamingConventionRuleOptions = [
  {
    // Needed to allow importing default exported React functional components
    // e.g. import DataCard from '@github-ui/data-card'
    selector: 'import',
    format: ['camelCase', 'PascalCase'],
  },
  {
    // Needed to allow for React functional components, which use PascalCase
    selector: 'function',
    format: ['camelCase', 'PascalCase'],
  },
  {
    // Needed to allow for React functional components, which use PascalCase
    // e.g. { MyComponent: () => { ... } }
    selector: ['variable', 'objectLiteralMethod'],
    types: ['function'],
    format: ['camelCase', 'PascalCase'],
    custom: {
      // Must contain at least one lowercase letter to avoid all caps single words which apparently satisfy PascalCase
      // e.g. const MYCOMPONENT: () => { ... }
      // e.g. { MYCOMPONENT: () => { ... } }
      regex: '(^[A-Z]{1,2}$|[a-z])',
      match: true,
    },
  },
]

const reactNamingConventionRules = {
  camelcase: 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    ...reactNamingConventionRuleOptions,
    ...tsNamingConventionRuleOptions,
  ],
}

const contextsNamingConventionRules = {
  camelcase: 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      // Needed to allow defining a context using PascalCase
      // e.g. const Context = createContext(null)
      selector: 'variable',
      modifiers: ['const'],
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    },
    ...reactNamingConventionRuleOptions,
  ],
}

const config = {
  plugins: ['import', 'simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'sort-imports': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'jest/no-standalone-expect': ['error', {additionalTestBlockFunctions: ['afterEach']}],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@primer/react/lib-esm/*'],
            message: `Don't import @primer/react internals. Should this be a nested component?`,
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'no-barrel-files/no-barrel-files': 'off',
        ...tsNamingConventionRules,
        '@typescript-eslint/no-unsafe-assignment': 'error',
      },
    },
    {
      files: ['*.jsx', '*.tsx'],
      rules: {
        ...reactNamingConventionRules,
      },
    },
    {
      files: ['**/contexts/*.jsx', '**/contexts/*.tsx'],
      rules: {
        ...contextsNamingConventionRules,
      },
    },
  ],
}

module.exports = config
