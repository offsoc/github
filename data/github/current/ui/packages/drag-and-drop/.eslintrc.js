module.exports = {
  extends: '../eslint-config-shared-components/eslint-config-shared-components.js',
  rules: {
    '@github-ui/github-monorepo/no-sx': 'error',
    // temporary disable to incrementally remove barrel files
    'no-barrel-files/no-barrel-files': 'off',
  },
}
