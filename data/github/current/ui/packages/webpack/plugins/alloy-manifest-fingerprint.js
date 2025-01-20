// @ts-check
/** @type {import('fs/promises')} */
const fs = require('fs/promises')
/** @type {import('path')} */
const path = require('path')
/** @type {import('crypto')} */
const {createHash} = require('crypto')
const {FINGERPRINT_SIZE} = require('../constants')

/**
 * @type {import('webpack').WebpackPluginInstance}
 */
class AlloyManifestFingerprintPlugin {
  /**
   * @type {import('webpack').WebpackPluginInstance['apply']}
   */
  apply(compiler) {
    if (!compiler.options.output.path) throw new Error('Compilation failed undexpectedly')

    const manifestPath = path.join(compiler.options.output.path, 'manifest.alloy.json')

    compiler.hooks.done.tapAsync('HermesCompilePlugin', async (_stats, callback) => {
      const fingerprintedPath = await this.fingerprintManifest(manifestPath)
      await this.updateManifest(manifestPath, fingerprintedPath)
      callback()
    })
  }

  /**
   * @type {(manifestPath: string) => Promise<string>}
   **/
  async fingerprintManifest(manifestPath) {
    const manifest = await fs.readFile(manifestPath)
    const hash = createHash('sha512').update(manifest).digest().toString('hex').slice(0, FINGERPRINT_SIZE)

    const fingerprintedPath = manifestPath.replace(/\.alloy.json$/, `-${hash}.json`)
    await fs.copyFile(manifestPath, fingerprintedPath)

    return fingerprintedPath
  }

  /**
   * @type {(manifestPath: string, fingerprintedPath: string) => Promise<void>}
   **/
  async updateManifest(manifestPath, fingerprintedPath) {
    const manifest = await fs.readFile(manifestPath, 'utf8')
    const parsedManifest = JSON.parse(manifest)
    parsedManifest.manifest = path.basename(fingerprintedPath)

    await fs.writeFile(manifestPath, JSON.stringify(parsedManifest, null, 2))
  }
}

module.exports = AlloyManifestFingerprintPlugin
