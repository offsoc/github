const config = require('@github-ui/jest/config')

module.exports = {
  ...config,
  transformIgnorePatterns: ['../../node_modules/(?!${vscode-languagesserver-types)'],
  moduleNameMapper: {
    // eslint-disable-next-line github/unescaped-html-literal
    '\\.css$': '<rootDir>/__tests__/__mocks__/styleMock.js',
  },
}
