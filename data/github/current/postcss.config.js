const { resolve } = require('node:path')
const path = require('path')
const fs = require('fs')

const STATIC_ASSET_MANIFEST_PATH = path.join(__dirname, 'public/assets/manifest.static.json')

let manifest
try {
  manifest = JSON.parse(fs.readFileSync(STATIC_ASSET_MANIFEST_PATH))
} catch (e) {
  console.error(`Could not load asset manifest from ${STATIC_ASSET_MANIFEST_PATH}`)
}

const removeStartingSlash = (str) => str.replace(/^\//, '')

module.exports = ({file, webpackLoaderContext}) => ({
  parser: 'postcss-scss',
  map: {
    sourcesContent: false,
    annotation: true,
  },
  plugins: [
    require('@csstools/postcss-sass')({
      // include rooot node_modules, potentially local node_modules and file dirname/context
      includePaths: [resolve(__dirname, 'node_modules'), 'node_modules', file.dirname || webpackLoaderContext.context],
      outputStyle: process.env.CSS_MINIFY === '0' ? 'expanded' : 'compressed',
    }),

    require('autoprefixer')(),

    require('postcss-url')({
      url: (asset) => {
        if (!manifest) return asset.url

        const fingerprintedPath = manifest[removeStartingSlash(asset.url)]
        if (!fingerprintedPath) return asset.url

        return `/assets/${fingerprintedPath}`
      }
    }),
  ],
})
