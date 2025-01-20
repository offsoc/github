const swcConfig = require('@github-ui/swc/config')

/** @type {import('jest').Config} */
module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', swcConfig],
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
}
