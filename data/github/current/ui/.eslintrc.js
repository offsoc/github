/**
 * This is a temporary eslint config for all ui packages.
 * It should be moved into a central eslint-config-shared package and imported by each package individually.
 */
const {baseConfig, noRestrictedSyntaxRules, noRestrictedImportsRule} = require('@github-ui/eslintrc')
const glob = require('glob')
const {readFileSync} = require('fs')
const {dirname, join} = require('path')

const findDevPackages = () => {
  const uiPackagesGlob = join(__dirname, 'packages/*/package.json')
  const packages = glob.sync(uiPackagesGlob, {ignore: 'node_modules/**', absolute: true})

  return packages.reduce((acc, package) => {
    const pkg = JSON.parse(readFileSync(package))

    if (pkg.dev) acc.push(`${dirname(package)}/**/*.{mjs,js,ts,tsx}`)

    return acc
  }, [])
}

module.exports = {
  ...baseConfig,
  root: true,
  rules: {
    ...baseConfig.rules,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/__tests__/**/*.{ts,tsx}',
          '**/__browser-tests__/**/*.ts',
          '**/test-utils/**/*.{ts,tsx}',
          '**/*.stories.*',
          '**/jest.config.js',
          ...findDevPackages()
        ],
      },
    ],
  },
  overrides: [
    ...baseConfig.overrides,
    {
      files: ['*.tsx'],
      excludedFiles: ['**/__tests__/**'],
      rules: {
        'i18n-text/no-en': 'off',
        'filenames/match-regex': [2, '^[A-Z][a-zA-Z]+(.[a-z0-9-]+)?$'],
      },
    },
    {
      files: ['*.ts'],
      rules: {
        ...noRestrictedSyntaxRules,
        'i18n-text/no-en': 'off',
      },
    },
    {
      files: ['*.ts?(x)'],
      excludedFiles: ['**/__tests__/**', '**/test-utils/**'],
      extends: ['plugin:ssr-friendly/recommended'],
      rules: noRestrictedImportsRule,
    },
  ],
}
