// eslint-disable-next-line import/no-commonjs
module.exports = {
  preset: '@github-ui/jest',
  testRegex: '(/__tests__/.*|(\\-|\\.|/)(test))\\.[jt]sx?$',
  globals: {
    SC_DISABLE_SPEEDY: JSON.stringify(false),
  },
  rootDir: 'src/',
  // eslint-disable-next-line github/unescaped-html-literal
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.ts'],
  testTimeout: 15000,
  /**
   * Jest with jsdom requires a custom resolver for msw v2,
   * because Jest defaults to using `browser` exports, which
   * msw's node api does not support currently
   */
  resolver: `${__dirname}/src/tests/resolver.cjs`,
  transform: {
    '.+\\.module\\.(css|scss)$': 'jest-css-modules-transform',
  },
}
