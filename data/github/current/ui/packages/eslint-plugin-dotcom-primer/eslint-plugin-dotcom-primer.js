module.exports = {
  rules: {
    'toast-migration': require('./rules/toast-migration'),
    'unnecessary-components': require('./rules/unnecessary-components'),
    'prefer-action-list-item-onselect': require('./rules/prefer-action-list-item-onselect'),
  },
  configs: {
    recommended: {
      rules: {
        '@github-ui/dotcom-primer/toast-migration': 'error',
        '@github-ui/dotcom-primer/prefer-action-list-item-onselect': 'error',
        '@github-ui/dotcom-primer/unnecessary-components': 'error',
      },
    },
  },
}
