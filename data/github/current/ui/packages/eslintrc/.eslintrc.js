module.exports = {
  parserOptions: {
    project: null,
  },
  overrides: [
    {
      files: ['package.json'],
      rules: {
        '@github-ui/github-monorepo/package-json-required-scripts': 'off',
        '@github-ui/github-monorepo/required-configuration-files': 'off',
        '@github-ui/github-monorepo/package-json-required-dev-dependencies': 'off',
      },
    },
  ],
}
