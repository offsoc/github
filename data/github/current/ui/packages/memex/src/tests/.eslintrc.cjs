module.exports = {
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:testing-library/react',
        'plugin:jest/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        // reject any usages of .only() in tests as we want all tests to run on CI
        'no-only-tests/no-only-tests': process.env.CI ? 'error' : 'warn',

        // enforcing this so that our tests are properly handling promises
        '@typescript-eslint/no-floating-promises': ['error'],

        // coding style rules that we could re-enable later
        '@typescript-eslint/no-non-null-assertion': ['off'],
        '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports plugin in inherited config
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
        'jest/consistent-test-it': ['error'],
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
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    {
      files: ['.eslintrc.cjs'],
      rules: {
        // ignore naming convention as this file needs to be named in a certain
        // way to be detected by ESLint
        'filenames/match-regex': ['off'],
        // muting any warning about upgrading to ES Modules for now
        'import/no-commonjs': ['off'],
      },
    },
    {
      files: ['features/find-in-project-test.tsx'],
      rules: {
        'testing-library/no-container': 'off',
        'testing-library/no-node-access': 'off',
      },
    },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
}
