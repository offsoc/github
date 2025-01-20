// @ts-check
const swcConfig = require('@github-ui/swc/config')
const path = require('path')

const isCI = Boolean(process.env.CI)
const isJanky = Boolean(process.env.GITHUB_CI)
const isReactNext = Boolean(process.env.REACT_NEXT)
let reporters = undefined

if (isJanky) {
  reporters = ['default', require.resolve('./reporters/janky-reporter.mjs')]
} else if (isCI) {
  reporters = [['github-actions', {silent: false}], require.resolve('./reporters/janky-reporter.mjs'), 'summary']
}

/**
 * Jest automatically ignores transforming node_modules, however
 * we want to transform these files if they are esm.
 *
 * To accommodate this we tell jest to not ignore these files.
 * by removing them from the transform ignore list by negated regex.
 */
const esmDependencies = [
  '@github-ui/query-builder-element',
  '@github-ui/query-builder',
  '@github/alive-client',
  '@github/auto-check-element',
  '@github/blackbird-parser',
  '@github/browser-support',
  '@github/catalyst',
  '@github/combobox-nav',
  '@github/g-emoji-element',
  '@github/hotkey',
  '@github/hydro-analytics-client',
  '@github/jtml',
  '@github/markdown-toolbar-element',
  '@github/multimap',
  '@github/paste-markdown',
  '@github/remote-form',
  '@github/stable-socket',
  '@github/template-parts',
  '@github/text-expander-element',
  '@github/webauthn-json',
  '@koddsson/textarea-caret',
  '@lit-labs/react',
  '@lit-labs/ssr-dom-shim',
  '@ngneat/falso',
  '@primer/behaviors',
  '@primer/behaviors/utils',
  '@primer/react-markdown-viewer/lib-esm',
  '@primer/react',
  '@primer/react/lib-esm',
  '@primer/react/node_modules/@github/combobox-nav',
  'date-fns',
  'globby',
  'leven',
  'lit-html',
  'lodash-es',
  'node-plop',
  'slash',
  'uuid',
]

/** @type {(relativePath: string) => string} */
function pathFromRoot(relativePath) {
  return path.join(__dirname, '../../../', relativePath)
}

/** @type {import('jest').Config} */
module.exports = {
  /**
   * Ensure that we only lookup modules from the node_modules folder, to avoid loading
   * some that might be in `vendored` dependencies
   */
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '@github/webauthn-json/browser-ponyfill': pathFromRoot('/node_modules/@github/webauthn-json'),
    '.*/ui-packages-tooling/plopfile.js': pathFromRoot('/ui/packages/ui-packages-tooling/plopfile.js'),
    ...(isReactNext
      ? {
          '^react$': pathFromRoot('/ui/packages/react-next/node_modules/react'),
          '^react-dom$': pathFromRoot('/ui/packages/react-next/node_modules/react-dom'),
        }
      : {}),
  },
  passWithNoTests: true,
  reporters,
  setupFilesAfterEnv: [require.resolve('./jest-setup.ts'), 'jest-canvas-mock'],
  testEnvironment: 'jsdom',
  // Use shorter timeout for local development, so slow tests fail fast instead of being flaky in CI.
  // This makes slow tests more noticeable, so devs can realize and improve them before committing.
  // This can be overridden per test.
  testTimeout: isCI ? 10_000 : 2500,
  transform: {
    '^.+\\.(t|m?j)sx?$': ['@swc/jest', {...swcConfig, sourceMaps: false}],
    '@primer\\/react\\/.+.css$': require.resolve('./transformers/cssTransformer.js'),
    '.+\\.module\\.(css|scss)$': 'jest-css-modules-transform',
  },
  // Some modules only export esm, and need to be transformed for jest
  transformIgnorePatterns: [`node_modules/(?!${esmDependencies.join('|')})`],
  workerThreads: true,
}
