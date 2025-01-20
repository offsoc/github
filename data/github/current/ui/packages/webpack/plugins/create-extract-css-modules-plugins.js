// @ts-check
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

/**
 * @typedef {Object} ExtractCssPluginOpts
 * @property {boolean} enableHotReloading When true, avoid adding a hash to the filename. This ensures HMR works correctly. When not in development mode, we want to hash for long term caching
 */

/**
 * Creates a set of CSS extraction and optimization plugins for css modules.
 * @type {(opts: ExtractCssPluginOpts) => Array<import('webpack').WebpackPluginInstance>}
 */
function createExtractCssModulesPlugins({enableHotReloading}) {
  return [
    new MiniCssExtractPlugin({
      // in development we avoid hashing so that HMR works correctly
      filename: enableHotReloading ? '[name].module.css' : '[name].[contenthash].module.css',
      chunkFilename: enableHotReloading ? '[id].module.css' : '[id].[contenthash].module.css',
      ignoreOrder: true,
    }),
    new CssMinimizerPlugin(),
  ]
}

module.exports = {createExtractCssModulesPlugins}
