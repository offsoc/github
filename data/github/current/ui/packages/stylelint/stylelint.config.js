// @ts-check

/**
 * @type {import('stylelint').Config}
 */
const config = {
  extends: ['@primer/stylelint-config'],
  ignoreFiles: ['js', 'json', 'ts', 'graphql', 'md'].map(ext => `**/*.${ext}`),
  quiet: true,
  cache: true,
}

module.exports = config
