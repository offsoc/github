// @ts-check
/* eslint eslint-comments/no-use: off */
import {transformAsync as babelTransform} from '@babel/core'
import {transform as swcTransform} from '@swc/core'
import swcConfig from '@github-ui/swc/config'
import {basename, extname} from 'path'
import {promises as fsPromises} from 'fs'
import {defaultReporter} from '@web/test-runner'
import {testRunnerJankyReporter} from './janky-reporter.mjs'
import {junitReporter} from '@web/test-runner-junit-reporter'
import {importMapsPlugin} from '@web/dev-server-import-maps'
import {playwrightLauncher} from '@web/test-runner-playwright'

const isCI = Boolean(process.env.GITHUB_CI)
const jsFileTypes = new Set(['js', 'ts', 'tsx'])
const bootstrapFile = '@github-ui/browser-tests/bootstrap'
const commonJsDependencies = [
  // These dependencies all export commonjs and need to be converted to esm to run in the browser
  '@github/blackbird-parser',
  '@github/sortablejs',
  'axe-core',
  'cronstrue',
  'color-convert',
  'codemirror',
  'codemirror-contrib',
  'js-yaml',
  'is-buffer',
  'extend',
]
  .map(name => `/node_modules/${name}`)
  .concat(['/ui/packages/microsoft-analytics/ms.analytics-web.js'])

/**
 *
 * @param {string} path
 * @returns {boolean}
 */
function isJsFileType(path) {
  const fileType = extname(path).slice(1)
  return jsFileTypes.has(fileType)
}

/**
 *
 * @param {string} path
 * @returns {boolean}
 */
function isCommonJsDependency(path) {
  return commonJsDependencies.some(dep => path.startsWith(dep))
}

const browsers = [
  playwrightLauncher({
    product: 'chromium',
    createBrowserContext({browser}) {
      return browser.newContext({timezoneId: 'UTC'})
    },
  }),
]

/**
 * @type {import('@web/test-runner').TestRunnerConfig}
 */
const config = {
  testFramework: {
    config: {
      timeout: isCI ? 30_000 : 10_000,
      retries: isCI ? 4 : 1,
    },
  },
  filterBrowserLogs: ({type}) => !['warn', 'debug', 'log'].includes(type),
  testsFinishTimeout: isCI ? 30_000 : 10_000,
  browserStartTimeout: isCI ? 60_0000 : 30_000,
  hostname: 'github.localhost',
  files: [
    'test/js/unit/**/test-*.(js|ts)',
    'test/components/**/*-test.ts',
    'ui/packages/**/__browser-tests__/*.test.ts',
  ],
  nodeResolve: {exportConditions: ['default']},
  port: 9293,
  browsers,
  plugins: [
    // vfile uses the pkg.browser field to map imports when running in browser environment
    // - https://github.com/github/github/blob/11a28158c3bb861ec23444ae429129a9187dc41e/node_modules/vfile/package.json#L38-L42
    // - https://docs.npmjs.com/cli/v9/configuring-npm/package-json#browser.
    // It seems that WTR / swc don't support that field, so we're re-implementing via import maps.
    importMapsPlugin({
      inject: {
        importMap: {
          imports: {
            './node_modules/vfile/lib/minpath.js': './node_modules/vfile/lib/minpath.browser.js',
            './node_modules/vfile/lib/minurl.js': './node_modules/vfile/lib/minurl.browser.js',
            './node_modules/vfile/lib/minproc.js': './node_modules/vfile/lib/minproc.browser.js',
          },
        },
      },
    }),
    {
      // For commonjs dependencies, we have to run babel to convert to ESM syntax
      name: 'commonjs-to-esm',
      async transform({path, body}) {
        if (isCommonJsDependency(path)) {
          // @ts-expect-error, body is not validated as a string yet and output from the transform could be null
          const {code} = await babelTransform(body, {
            compact: false,
            plugins: ['transform-commonjs'],
          })
          return code
        }
      },
    },
    {
      // This is a custom plugin that uses SWC to compile js/ts/tsx files to esm
      name: 'swc-plugin-relay',
      resolveMimeType(context) {
        // We need to tell the browser that these files are in fact JavaScript, since their extension is not necessarily .js
        if (isJsFileType(context.path)) {
          return 'js'
        }
      },
      async transform({path, body}) {
        const shouldTransform =
          !path.includes('node_modules') &&
          !path.includes('tmp/smoke-test-assets') &&
          !path.includes('__web-dev-server__') &&
          !path.includes('static/javascripts/') &&
          path !== '/mockServiceWorker.js' &&
          isJsFileType(path)
        if (!shouldTransform) {
          return
        }

        // Transform the file using SWC
        // @ts-expect-error body is not validated as a string yet
        const out = await swcTransform(body, {
          // We can re-use our SWC config that is shared with the rest of dotcom
          ...swcConfig,
          jsc: {
            ...swcConfig.jsc,
            parser: {
              ...swcConfig.jsc?.parser,
              // If we apply tsx transforms to all files, some of our .ts files fail on `<HTMLElement>` type casts.
              tsx: path.endsWith('.tsx'),
            },
          },

          // The following config to gives us proper source maps for errors
          filename: basename(path),
          sourceMaps: 'inline',
        })

        return `import '${bootstrapFile}';${out.code}`
      },
    },
    {
      // This is a custom plugin that will proxy contents of files from the ./public directory
      name: 'public-static-proxy',
      async serve({path}) {
        if (path.startsWith('/static/') || path.startsWith('/images/')) {
          const file = await fsPromises.readFile(`./public${path}`)
          return file.toString()
        }
        if (path === '/mockServiceWorker.js') {
          const file = await fsPromises.readFile(`./test/assets/mockServiceWorker.js`)
          return file.toString()
        }
      },
    },
  ],
  testRunnerHtml: testFramework => {
    // We need to inject our setup/bootstrap files into the test runner HTML
    // eslint-disable-next-line github/unescaped-html-literal
    return `<html>
        <body>
          <script type="module" src="node_modules/axe-core/axe.js"></script>
          <script type="module" src="${testFramework}"></script>
        </body>
      </html>`
  },
  reporters: isCI
    ? // In CI, we want to report errors in Janky format
      [defaultReporter(), testRunnerJankyReporter, junitReporter({outputPath: 'tmp/js-tests.xml'})]
    : // Otherwise, use the default reporter
      undefined,
}

export default config
