const {baseConfig, noRestrictedSyntaxRules, noRestrictedImportsRule} = require('@github-ui/eslintrc')

module.exports = {
  ...baseConfig,
  root: true,
  overrides: [
    ...baseConfig.overrides,
    {
      files: ['assets/modules/github/**.ts'],
      rules: noRestrictedSyntaxRules,
    },
    {
      files: ['*.tsx'],
      excludedFiles: ['**/__tests__/**'],
      rules: {
        'i18n-text/no-en': 'off',
        'filenames/match-regex': [2, '^[A-Z][a-zA-Z]+(.[a-z0-9-]+)?$'],
      },
    },
    {
      files: ['**/*.ts?(x)'],
      excludedFiles: [
        'assets/modules/*.ts',
        'assets/workers/*.ts',
        'assets/modules/?(audit-log-streaming|personal-access-tokens-onboarding|marketing|lookbook|github)/**/*.ts',
        'components/**/*.ts',
        '**/__tests__/**',
        '**/test-utils/**',
      ],
      extends: ['plugin:ssr-friendly/recommended'],
      rules: noRestrictedImportsRule,
    },
    {
      files: ['package.json'],
      rules: {
        '@github-ui/github-monorepo/package-json-required-fields': 'off',
      },
    },
  ],
}
