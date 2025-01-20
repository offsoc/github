module.exports = {
  plugins: ['simple-import-sort', 'import'],
  rules: {
    'filenames/match-regex': 'off',
    camelcase: 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-deprecated': 'warn',
    'sort-imports': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/*'],
      rules: {
        'github/unescaped-html-literal': 0,
      },
    },
    {
      files: ['emojis.ts'],
      rules: {
        camelcase: 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
      typescript: true,
    },
  },
}
