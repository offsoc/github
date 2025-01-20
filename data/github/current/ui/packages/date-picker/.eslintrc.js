module.exports = {
  extends: '../eslint-config-shared-components/eslint-config-shared-components.js',
  rules: {
    // temporary disable to incrementally remove barrel files
    'no-barrel-files/no-barrel-files': 'off',
    '@github-ui/github-monorepo/no-sx': 'error',
  },
}
