// @ts-check
/**
 * This is the Webpack configuration responsible for compiling/bundling the alloy bundle
 * The alloy bundle is loaded by the alloy sidecar, which performs server-side rendering for React
 */
const TerserPlugin = require('terser-webpack-plugin')
const {DefinePlugin, SourceMapDevToolPlugin, optimize, WatchIgnorePlugin} = require('webpack')
const WarningsToErrorsPlugin = require('warnings-to-errors-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const path = require('path')
const swcConfig = require('@github-ui/swc/config')
const {FINGERPRINT_SIZE} = require('./constants')
const {pathFromRoot, relativePathFromRoot, globFromRoot} = require('./path-utils')
const {
  NODE_ENV = 'development',
  DESTINATION = 'public/assets',
  WEBPACK_ANALYZE = 'false',
  SKIP_RELAY = 'false',
} = process.env
const {ssrShimFileMap} = require('@github-ui/ssr-shims')
const {createCssModulesLoaderRule} = require('./loaders/create-css-modules-loader-rule')
const {createPrimerReactLoaderRule} = require('./loaders/create-primer-react-loader-rule')
const {createExtractCssModulesPlugins} = require('./plugins/create-extract-css-modules-plugins')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const AlloyManifestFingerprintPlugin = require('./plugins/alloy-manifest-fingerprint')

// Compile Relay assets before we start webpack
if (SKIP_RELAY !== 'true') {
  require('@github-ui/relay-build/compile-relay')
}

// mutate the swc config to always disable refresh for Alloy:
/**
 * @type {import('@swc/core').Config}
 */
const alteredSwcConfig = {
  ...swcConfig,
  jsc: {
    ...swcConfig.jsc,
    transform: {
      ...swcConfig.jsc?.transform,
      react: {
        ...swcConfig.jsc?.transform?.react,
        refresh: false,
      },
    },
  },
}

const FINGERPRINT_REGEX = new RegExp(`-[0-9a-f]{${FINGERPRINT_SIZE}}\\.js`)
const isDevelopment = NODE_ENV === 'development'

/**
 * @type {Record<string, string>}
 */
const entry = {
  alloy: path.resolve('./app/assets/modules/alloy/index.ts'),
}

const modules = globFromRoot('app/assets/modules/alloy-standalone/*.ts')
for (const modulePath of modules) {
  const {name} = path.parse(modulePath)
  entry[name] = modulePath
}

const packages = globFromRoot('ui/packages/*/ssr-standalone-entry.ts')
for (const packagePath of packages) {
  const name = path.basename(path.dirname(packagePath))
  entry[name] = packagePath
}

const alloyEntries = new Set(Object.keys(entry))

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  /**
   * The mode tells Webpack which environment we are building for. In production, it will minify and split the files
   * in a more optimized fashion.
   */
  mode: NODE_ENV === 'development' ? 'development' : 'production',

  /**
   * Alloy is built to run on a Node.js server
   **/
  target: 'node18',
  cache: isDevelopment && {
    type: 'memory',
    maxGenerations: 2,
  },

  /**
   * We can disable the default devtools because we manually configure the SourceMapDevToolPlugin.
   */
  devtool: false,

  entry,
  output: {
    /**
     * The webpack output usually goes to public/assets, but is sometimes overridden for testing purposes.
     */
    path: pathFromRoot(DESTINATION),

    filename: `[name]-[contenthash:${FINGERPRINT_SIZE}].js`,

    /**
     * The library config tells webpack how we want to handle exports
     * In this case, we want to export the default export from alloy/index.ts as the default export from the bundle
     * Alloy expects this default export to be a pure function that takes a render request and returns html
     */
    library: {
      type: 'commonjs2',
      export: 'default',
    },

    chunkFilename: 'chunk-[id].js',

    /**
     * We expect all file fingerprints to be generated using the same algorithm (sha512).
     * If we don't set this manually, webpack defaults to md4, which will cause our validation steps to fail when
     * checking asset fingerprints.
     */
    hashFunction: 'sha512',
  },
  optimization: {
    runtimeChunk: false,
    realContentHash: true,
    minimizer: [
      /**
       * Rather than using standard terser, we use SWC for minification. It has similar options and output, but is
       * significantly faster.
       */
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions: {
          compress: {
            keep_classnames: true,
            keep_fnames: true,
          },
          mangle: {
            keep_classnames: true,
            keep_fnames: true,
          },
        },
      }),
    ],
    splitChunks: {
      /**
       * Bundle splitting isn't relevant in Alloy as we don't need to optimize network requests over localhost.
       * Alloy expects to receive a single, unchunked bundle.
       */
      chunks: () => false,
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.module.css', '.module.scss'],
    alias: ssrShimFileMap,
  },
  module: {
    rules: [
      createCssModulesLoaderRule({emit: false}),
      createPrimerReactLoaderRule({emit: false}),
      {
        /**
         * All of our ts and tsx files need to be transpiled to javascript. We do this using SWC,
         * which will transpile them _without_ doing any type checking.
         */
        test: /\.tsx?$/,
        loader: 'swc-loader',
        options: alteredSwcConfig,
      },
      {
        /**
         * We have a custom loader that will dynamically find and import all ui packages with an ssr-entry.ts file
         */
        test: /alloy\/index\.ts$/,
        loader: require.resolve('./loaders/dynamic-alloy-loader.js'),
      },
    ],
  },
  plugins: [
    new WatchIgnorePlugin({paths: [/css\.d\.ts$/]}),
    new AlloyManifestFingerprintPlugin(),
    new WebpackAssetsManifest({
      output: 'manifest.alloy.json',
      customize({key, value}) {
        if (key.endsWith('.map')) {
          return {
            key: key.replace(FINGERPRINT_REGEX, ''),
            // @ts-expect-error we have a custom config here with a src property
            value: value.src,
          }
        }

        return {
          key: key.replace('.js', ''),
          // @ts-expect-error we have a custom config here with a src property
          value: value.src,
        }
      },
      transform(manifest) {
        /** @type {Record<string, Record<string,string>|string[]>} */
        const manifestWithChunkList = {}
        /** @type {Record<string, string>} */
        const bundles = {}
        /** @type {string[]} */
        const chunks = []
        /** @type {string[]} */
        const sourcemaps = []

        for (const key in manifest) {
          const src = manifest[key]
          if (typeof src !== 'string') throw new Error('invalid manifest')

          if (alloyEntries.has(key)) {
            bundles[key] = src
          } else if (key.endsWith('.map')) {
            sourcemaps.push(src)
          } else {
            chunks.push(src)
          }
        }

        manifestWithChunkList.entries = bundles
        manifestWithChunkList.chunks = chunks
        if (isDevelopment) manifestWithChunkList.sourcemaps = sourcemaps

        return manifestWithChunkList
      },
    }),
    new SourceMapDevToolPlugin({
      filename: `[name]-[contenthash:${FINGERPRINT_SIZE}].js.map`,
      /** @type {(info: {absoluteResourcePath: string}) => string} */
      moduleFilenameTemplate: info => {
        /**
         * We want the source maps to refer to the original file from the base directory.
         * This is useful for referencing the mapped files in Sentry.
         */
        return relativePathFromRoot(info.absoluteResourcePath)
      },
    }),

    // We want to treat any warnings as errors, so that they don't slip through CI and show a warning overlay to all devs
    new WarningsToErrorsPlugin(),

    new optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),

    new DefinePlugin({
      /**
       * We want to be able to include information about the bundler used when we report stats/errors
       * to the server
       */
      BUNDLER: JSON.stringify('webpack-alloy'),

      /**
       * HTMLElement is not defined in Node.js. With some client code, such as Custom Elements,
       * we have `class MyElement extends HTMLElement` in code that runs at the top level. We don't
       * actually need these classes to fully function in SSR, but we do need some replacement for the
       * global HTMLElement references. To keep things simple, we just swap these with `Object` which is
       * defined globally and can be extended.
       */
      HTMLElement: 'Object',
    }),

    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['alloy*'],
    }),

    ...createExtractCssModulesPlugins({enableHotReloading: false}),
    /**
     * The production bundles are intentionally obfuscated, which makes it hard to determine what is in them.
     * This plugin allows us to generate an analysis page which lets you dive into bundles and explore the contents.
     * To run the analyzer, use `npm run webpack:alloy:prod:analyze`
     */
    ...(WEBPACK_ANALYZE === 'true' ? [new BundleAnalyzerPlugin()] : []),
  ],
}

module.exports = config
