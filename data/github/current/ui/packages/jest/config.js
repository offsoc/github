// @tscheck

/**
 * NB: Most configuration should live in the `/ui/packages/jest/jest-preset.js` file that this extends.
 * This is the configuration used for running tests in individual packages.
 * For the top-level config see `/jest.config.js`
 */

/** @type {import('jest').Config} */
module.exports = {
  preset: '@github-ui/jest',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
}
