// @ts-check
/** @type {import('fs')} */
const fs = require('fs')
/** @type {import('./config-paths')} */
const {pathFromRoot, SERVICE_OWNERS_FILE_PATH} = require('./config-paths')
/** @type {import('./generate-serviceowners')} */
const {generateServiceownersFiles} = require('./generate-serviceowners')

/**
 * @class
 */
class QueriesToServiceOwnersPlugin {
  /** @param {{debug?: boolean}} options */
  constructor(options) {
    if (!fs.existsSync(SERVICE_OWNERS_FILE_PATH)) {
      fs.mkdirSync(SERVICE_OWNERS_FILE_PATH)
    }
    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp')
    }
    this.early_stop = !fs.existsSync(pathFromRoot('bin/serviceowners'))
    this.debug = options.debug || false
  }

  /**
   * Apply the plugin.
   * @type {(compiler: import('webpack').Compiler) => Promise<void>} compiler - The Webpack compiler instance.
   */
  async apply(compiler) {
    compiler.hooks.afterCompile.tapPromise('QueriesToServiceOwnersPlugin', async () => {
      if (this.early_stop) {
        return
      }

      generateServiceownersFiles()
    })
  }
}

module.exports = QueriesToServiceOwnersPlugin
