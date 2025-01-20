const {noRestrictedImportsRule} = require('@github-ui/eslintrc')

module.exports = {
  extends: ['prettier'],
  plugins: ['simple-import-sort', 'import', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    camelcase: 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-deprecated': 'warn',
    'sort-imports': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    ...noRestrictedImportsRule,
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
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    {
      files: ['**/__tests__/**'],
      rules: {
        'github/unescaped-html-literal': 0,
        'no-restricted-imports': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
      },
    },
    {
      files: ['**/copilot-chat-service.ts'],
      rules: {
        camelcase: 'off',
      },
    },
    {
      files: ['.eslintrc.js'],
      rules: {
        // ignore naming convention as this file needs to be named in a certain
        // way to be detected by ESLint
        'filenames/match-regex': ['off'],
        // muting any warning about upgrading to ES Modules for now
        'import/no-commonjs': ['off'],
        'no-restricted-imports': ['off'],
        'import/no-extraneous-dependencies': ['off'],
        '@typescript-eslint/no-var-requires': ['off'],
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
