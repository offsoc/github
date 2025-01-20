const {baseConfig} = require('@github-ui/eslintrc')

module.exports = {
  ...baseConfig,
  root: true,
  parserOptions: {
    project: ['tsconfig.global.json', 'tsconfig.wtr.json'],
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.json'],
  },
  overrides: [
    {
      files: ['*.json'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
    },
    {
      files: ['package.json'],
      rules: {
        '@github-ui/github-monorepo/required-configuration-files': 'off',
      },
    },
  ],
}
