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
}
