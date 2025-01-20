module.exports = {
  extends: ['prettier'],
  plugins: ['simple-import-sort', 'import', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'no-barrel-files/no-barrel-files': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-deprecated': 'warn',
    'sort-imports': 'off',
  },
  overrides: [
    {
      files: ['hooks/use-tree-pane.tsx'],
      rules: {
        'filenames/match-regex': ['off'],
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
