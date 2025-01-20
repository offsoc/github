const path = require('path')
const baseConfig = require('@github-ui/jest/config')

/**
 * The main Jest config lives in ui/packages/jest-preset.js
 * This file is only here for Jest watch and coverage, which runs jest at the top level
 * All other use cases for Jest should be executed at the package level, with
 * each package having it's own jest.config.js
 */

module.exports = {
  ...baseConfig,

  // List all possible test file locations
  testMatch: [
    path.join(__dirname, '/app/assets/modules/**/__tests__/**/*.test.ts?(x)'),
    path.join(__dirname, '/ui/**/__tests__/**/*.test.ts?(x)'),
  ],
}
