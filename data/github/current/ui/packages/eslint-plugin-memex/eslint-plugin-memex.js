module.exports = {
  rules: {
    'no-locator-test-id': require('./rules/no-locator-test-id'),
    'no-wait-for-selector-visible': require('./rules/no-wait-for-selector-visible'),
  },
  configs: {
    playwright: {
      rules: {
        '@github-ui/memex/no-locator-test-id': 'error',
        '@github-ui/memex/no-wait-for-selector-visible': 'error',
      },
    },
  },
}
