module.exports = {
  extends: ['prettier'],
  plugins: ['simple-import-sort', 'import', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    camelcase: 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'i18n-text/no-en': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-deprecated': 'warn',
    'sort-imports': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  ignorePatterns: ['**/coverage/**'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        'i18n-text/no-en': 'off',
        '@typescript-eslint/no-floating-promises': ['error'],
        '@typescript-eslint/require-await': ['error'],
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: {attributes: false},
            checksConditionals: false,
          },
        ],
        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-unsafe-member-access': ['off'],
        '@typescript-eslint/no-unused-vars': ['off'], // handled by unused-imports plugin in inherited config
      },
      parserOptions: {
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    {
      files: ['**/__tests__/**'],
      extends: ['plugin:testing-library/react', 'plugin:jest/recommended'],
      rules: {
        'github/unescaped-html-literal': 0,
        'no-restricted-imports': 'off',
        // reject any usages of .only() in tests as we want all tests to run on CI
        'no-only-tests/no-only-tests': process.env.CI ? 'error' : 'warn',

        // enforcing this so that our tests are properly handling promises
        '@typescript-eslint/no-floating-promises': ['error'],

        // coding style rules that we could re-enable later
        '@typescript-eslint/no-non-null-assertion': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-unsafe-member-access': ['off'],
        '@typescript-eslint/no-unsafe-call': ['off'],
        '@typescript-eslint/restrict-template-expressions': ['off'],
        '@typescript-eslint/no-unsafe-return': ['off'],
        '@typescript-eslint/no-unsafe-argument': ['off'],
        '@typescript-eslint/no-extra-semi': ['off'],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-import-type-side-effects': 'error',
        // rules for test authoring and formatting
        'jest/no-conditional-expect': 'off',
        'jest/consistent-test-it': ['error', {fn: 'it', withinDescribe: 'it'}],
        'jest/expect-expect': [
          'error',
          {
            assertFunctionNames: ['expect*'],
            additionalTestBlockFunctions: [],
          },
        ],
        'jest/prefer-lowercase-title': [
          'error',
          {
            ignore: ['describe'],
          },
        ],
        'react/jsx-no-constructed-context-values': 'off',
        'testing-library/prefer-user-event': 'error',

        // skip any localization requirements for test directory
        'i18n-text/no-en': 'off',
      },
    },
    {
      files: ['**/*.stories.tsx', '**/__tests__/utils/*.tsx'],
      rules: {
        // Storybook tests use `canvas` instead of `screen`
        'testing-library/prefer-screen-queries': ['off'],
      },
    },
  ],
}
