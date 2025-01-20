const noRestrictedImportsConfig = {
  paths: [
    {
      name: 'lodash',
      message: 'Please use bundled utilities instead of pulling in third party dependencies.',
    },
    {
      name: 'lodash-es',
      message: 'Please use bundled utilities instead of pulling in third party dependencies.',
    },
    {
      name: '@playwright/test',
      importNames: ['default', 'test'],
      message: 'Please use fixtures/test-extended instead, which provides additional fixture utilities',
    },
  ],
}

// The `playwright/no-element-handle` restricts calls to `page.$` and `page.$$`, but it does not restrict
// calls to `elementHandle.$` and `elementHandle.$$`. So, these are some custom syntax rules to restrict those calls.
const noElementHandleSyntaxExtended = [
  // Disallow any calls like `el.$()` where `el` is not `page`, so it does not conflict with the `playwright/no-element-handle` rule.
  {
    selector: 'CallExpression[callee.object.type="Identifier"][callee.object.name!="page"][callee.property.name="$"]',
    message:
      'Prefer using the Locator API to select elements instead of `$`. (https://playwright.dev/docs/api/class-locator)',
  },
  {
    selector: 'CallExpression[callee.object.type="Identifier"][callee.object.name!="page"][callee.property.name="$$"]',
    message:
      'Prefer using the Locator API to select elements instead of `$$`. (https://playwright.dev/docs/api/class-locator)',
  },
]

module.exports = {
  env: {
    node: true,
  },
  extends: ['plugin:playwright/recommended', 'plugin:@github-ui/memex/playwright'],
  rules: {
    'no-restricted-imports': ['error', noRestrictedImportsConfig],

    // reject any usages of .only() in tests as we want all tests to run on CI
    'no-only-tests/no-only-tests': process.env.CI ? 'error' : 'warn',

    'playwright/no-element-handle': ['error'],
    'no-restricted-syntax': ['error', ...noElementHandleSyntaxExtended],

    // muting all these new rules for now as well
    'playwright/no-force-option': ['off'],
    'playwright/no-wait-for-timeout': ['off'],
    'playwright/no-eval': ['off'],
    'playwright/no-skipped-test': ['off'],
    'playwright/no-conditional-in-test': ['off'],
    'playwright/expect-expect': ['off'],
    'playwright/prefer-web-first-assertions': ['off'],

    // Playwright tests must not contain imports from the client directory
    // due to a Babel (used in Playwright) and how it transpiles some newer
    // TS syntax such as `const enum`
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {target: './', from: '../tests/'},
          {target: './', from: '../client/'},
        ],
      },
    ],

    // tests do not need to be localized
    'i18n-text/no-en': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
      rules: {
        // report any issues where assertions are unnecessary
        '@typescript-eslint/no-non-null-assertion': 'error',

        // allow numbers and booleans to be used in template expressions
        '@typescript-eslint/restrict-template-expressions': 'off',

        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-import-type-side-effects': 'error',
        // report any issues with unused variables, but allow `_` to be used as
        // a variable prefix to ignore this rule
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'error',
          {ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
        ],

        // ensure all Promise-based APIs are handled correctly in tests
        '@typescript-eslint/no-floating-promises': 'error',
      },
    },
    {
      files: ['.eslintrc.cjs', '**/**/playwright.config.ts'],
      rules: {
        // ignore naming convention as this file needs to be named in a certain
        // way to be detected by ESLint
        'filenames/match-regex': ['off'],
        // muting any warning about upgrading to ES Modules for now
        'import/no-commonjs': ['off'],
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
}
