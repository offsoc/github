// @ts-check
const path = require('path')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WarningsToErrorsPlugin = require('warnings-to-errors-webpack-plugin')
const {SourceMapDevToolPlugin} = require('webpack')
const {FINGERPRINT_SIZE} = require('./constants')
const {pathFromRoot, relativePathFromRoot, globFromRoot} = require('./path-utils')
const globs = [
  'app/components/**/*.scss',
  'app/assets/stylesheets/bundles/*/index.scss',
  'app/assets/stylesheets/variables/themes/*.scss',
  'app/assets/stylesheets/marketing/*.scss',
]
const entryFiles = globs.reduce(
  (
    /** @type {Array<string>} */
    acc,
    g,
  ) => {
    return [...acc, ...globFromRoot(g)]
  },
  [],
)
/** @type {Record<string, string | {import: string; dependOn: Array<string>}>} */
const entry = {}
const {NODE_ENV = 'development', DESTINATION = 'public/assets', WEBPACK_SERVE} = process.env
const isDev = NODE_ENV === 'development'

for (const fullPath of entryFiles) {
  const fileFolder = fullPath.split('/').slice(-3)
  let fileName = path.basename(fullPath).replace('.scss', '')
  if (fileName === 'index' && fileFolder[0] === 'bundles') {
    const maybeFileName = fileFolder[1]
    if (!maybeFileName) throw new Error('file must have name')
    fileName = maybeFileName
  }
  const importPath = `./${relativePathFromRoot(fullPath)}`

  if (fileName === 'development' || !isDev) {
    entry[fileName] = importPath
  } else {
    // embed the runtime in the development file.  This isn't needed for production
    entry[fileName] = {
      import: importPath,
      dependOn: ['development'],
    }
  }
}

const isDevelopment = NODE_ENV === 'development'
const cache =
  isDevelopment && WEBPACK_SERVE !== 'true'
    ? {type: 'filesystem', buildDependencies: {config: [__filename]}}
    : undefined

module.exports = {
  mode: isDev ? 'development' : 'production',
  cache,
  devtool: false,
  entry,
  output: {
    path: pathFromRoot(DESTINATION),
    filename: `[name]-[contenthash:${FINGERPRINT_SIZE}].css.js`,
    hashFunction: 'sha512',

    // This is required to run multiple webpack instances in parallel
    chunkLoadingGlobal: 'webpackCssChunkLoading',
    hotUpdateGlobal: 'webpackCssHotUpdate',
    hotUpdateChunkFilename: '[id].[fullhash].hot-update.css.js',
    hotUpdateMainFilename: '[runtime].[fullhash].hot-update.css.json',
  },
  optimization: {
    realContentHash: true,
  },
  resolve: {
    extensions: ['.scss', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // HMR won't work if we include content hash in the filename
      filename: WEBPACK_SERVE ? '[name].css' : `[name]-[contenthash:${FINGERPRINT_SIZE}].css`,
    }),

    // Manually configure source maps, so that contenthash fingerprint for js files is accurate
    new SourceMapDevToolPlugin({
      filename: `[name]-[contenthash:${FINGERPRINT_SIZE}].css.map`,
      /** @type {(info: {absoluteResourcePath: string}) => string} */
      moduleFilenameTemplate: info => {
        // We want the source maps to refer to the original file from the base directory
        return relativePathFromRoot(info.absoluteResourcePath)
      },
    }),

    // This will generate the manifest.json file used by the server to determine bundle names in the CDN
    new WebpackAssetsManifest({
      output: 'manifest.css.json',
      customize({key, value}) {
        if (key.toLowerCase().endsWith('.map')) {
          // we don't need source maps in the manifest.json
          return false
        }

        if (!isDev && key.endsWith('.js')) {
          // The js files are for local dev only, we do not need them in the prod manifest
          return false
        }

        const serverKey = key.endsWith('.js') ? key.replace('.js', '.css.js') : key
        return {
          key: serverKey,
          // @ts-expect-error we have a custom format with a src property
          value: value.src,
        }
      },
      transform(manifest) {
        for (const key in manifest) {
          const src = manifest[key]
          manifest[key] = {src}
        }
      },
    }),

    // We want to treat any warnings as errors, so that they don't slip through CI and show a warning overlay to all devs
    new WarningsToErrorsPlugin(),
  ],
  devServer: {
    compress: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    port: 3012,
    client: {
      webSocketURL: 'ws://0.0.0.0:0/webpack-css-ws',
    },
    static: false,
  },
}
