// @ts-check
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

/**
 * @typedef {Object} PrimerReactLoaderRuleOpts
 * @property {boolean} emit Whether to emit the css file or not. When Server Rendering we should not emit the file
 * @property {boolean} [isCSSLayers] If we should wrap the css in a `@layer primer-react` directive
 */

/**
 * Creates a loader with configuration for handling css loading and transformation. These rules only apply to *.css files from `@primer/react`
 *
 * @type {(opts: PrimerReactLoaderRuleOpts) => import('webpack').RuleSetRule}
 */
function createPrimerReactLoaderRule(opts) {
  const config = {
    test: /.*node_modules\/@primer\/react\/.*\.css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          // in SSR we don't want to emit a file
          emit: opts.emit,
        },
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          url: false,
        },
      },
    ],
  }

  if (opts.isCSSLayers) {
    config.use.push({
      loader: require.resolve('./primer-react-css-layer-loader.js'),
      options: {
        sourceMap: true,
        url: false,
      },
    })
  }

  return config
}

module.exports = {createPrimerReactLoaderRule}
