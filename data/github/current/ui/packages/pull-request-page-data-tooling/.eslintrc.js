module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  ignorePatterns: ['tsconfig.json', 'jest.config.js', 'package.json', '.eslintrc.js'],
  plugins: ['simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    'no-barrel-files/no-barrel-files': 'off',
    'filenames/match-regex': 'off',
    camelcase: 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/newline-after-import': 'error',
    'import/no-deprecated': 'warn',
    'sort-imports': 'off',
    'react/jsx-sort-props': [
      'error',
      {
        reservedFirst: true,
        shorthandFirst: true,
        callbacksLast: true,
        multiline: 'last',
        ignoreCase: false,
      },
    ],
    '@typescript-eslint/no-non-null-assertion': ['off'],
  },
  overrides: [
    {
      files: ['**/__tests__/*'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': ['off'],
      },
    },
  ],
}
