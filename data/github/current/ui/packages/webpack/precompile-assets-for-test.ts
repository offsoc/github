import type {Configuration, EntryObject} from 'webpack'
import {existsSync, writeFileSync, mkdirSync} from 'fs'
import {join} from 'path'
import {rootPath} from './path-utils'
import jsConfig from './webpack.config'
import cssConfig from './webpack-css.config'
import bundlerFlags from './bundler-flags.json'

type Manifest = Record<string, {src: string}>
type FlatManifest = Record<string, string>
type BundlerFlags = Record<string, {flag: string; bundler: string}>

const publicPath = join(rootPath, 'public')
const assetsPath = join(publicPath, 'assets')
const jsManifestPath = join(assetsPath, 'manifest.json')
const cssManifestPath = join(assetsPath, 'manifest.css.json')
const alloyManifestPath = join(assetsPath, 'manifest.alloy.json')

const fakeChecksum = 'aaaaaaaaaaaa'

/** Validate the external webpack config has it's entry points configured in a way that we can traverse */
function validateConfigShape(config: Configuration): EntryObject | null {
  if (!config.entry || typeof config.entry !== 'object' || Array.isArray(config.entry)) {
    return null
  }

  return config.entry
}

/** Ensure the parent directories for the manifest exist on disk */
function setupDirectoryStructure() {
  if (!existsSync(publicPath)) {
    mkdirSync(publicPath)
  }

  if (!existsSync(assetsPath)) {
    mkdirSync(assetsPath)
  }
}

/**
 * Generate a stub Javascript manifest based on the Webpack config which can be passed to the Rails test suite
 * and not rely on running webpack and transpiling all of the assets on disk.
 */
function generateJavascriptManifest(entry: EntryObject): Manifest {
  const manifest: Manifest = {}

  // defining some entry points that are required in tests but not
  // visible through the webpack config's entry object
  manifest['wp-runtime.js'] = {src: `wp-runtime-${fakeChecksum}.js`}
  manifest['environment.js'] = {src: `environment-${fakeChecksum}.js`}

  const propertyNames = Object.getOwnPropertyNames(entry)
  for (const propertyName of propertyNames) {
    const value = entry[propertyName]
    if (typeof value !== 'string') {
      throw new Error(`Unexpected entry point value: ${value}`)
    }

    const fileName = `${propertyName}.js`
    const sourceValue = `${propertyName}-${fakeChecksum}.js`
    const recordValue = {src: sourceValue}

    manifest[fileName] = recordValue
  }

  return manifest
}

/**
 * Generate a stub CSS manifest based on the Webpack config which can be passed to the Rails test suite
 * and not rely on running webpack and transpiling all of the assets on disk.
 */
function generateStubCssManifest(entry: EntryObject): Manifest {
  const manifest: Manifest = {}

  const propertyNames = Object.getOwnPropertyNames(entry)
  for (const propertyName of propertyNames) {
    const cssFileName = `${propertyName}.css`
    const cssSourceFileName = `${propertyName}-${fakeChecksum}.css`
    manifest[cssFileName] = {src: cssSourceFileName}

    const jsCssFileName = `${cssFileName}.js`
    manifest[jsCssFileName] = {src: `${cssSourceFileName}.js`}
  }

  return manifest
}

function generateStubAlloyManifest(): FlatManifest {
  return {
    'alloy.js': `alloy-${fakeChecksum}.js`,
    'alloy.js.map': `alloy-${fakeChecksum}.js.map`,
  }
}

/**
 * Write the manifest object to disk as JSON
 */
function persistManifest(path: string, manifest: Manifest | FlatManifest) {
  const manifestText = JSON.stringify(manifest, null, 2)
  writeFileSync(path, manifestText)
}

/**
 * Write the assets object to disk
 */
function persistAssets(jsManifest: Manifest, cssManifest: Manifest, alloyManifest: FlatManifest) {
  for (const {src: asset} of [...Object.values(jsManifest), ...Object.values(cssManifest)]) {
    writeFileSync(join(assetsPath, asset), '')
  }
  for (const asset of Object.values(alloyManifest)) {
    writeFileSync(join(assetsPath, asset), '')
  }
}

function main(jsEntryObject: EntryObject, cssEntryObject: EntryObject) {
  setupDirectoryStructure()

  const jsManifest = generateJavascriptManifest(jsEntryObject)
  persistManifest(jsManifestPath, jsManifest)

  for (const bundlerFlagKey of Object.getOwnPropertyNames(bundlerFlags as BundlerFlags)) {
    const manifestPath = join(assetsPath, `manifest.${bundlerFlagKey}.json`)
    persistManifest(manifestPath, jsManifest)
  }

  const cssManifest = generateStubCssManifest(cssEntryObject)
  persistManifest(cssManifestPath, cssManifest)

  const alloyManifest = generateStubAlloyManifest()
  persistManifest(alloyManifestPath, alloyManifest)

  persistAssets(jsManifest, cssManifest, alloyManifest)
}

const jsEntry = validateConfigShape(jsConfig as unknown as Configuration)
if (jsEntry === null) {
  console.error(
    'webpack.config.js defines entry points that are not stored as an EntryObject. Abandoning precompilation work...',
  )
  process.exit(-1)
}

const cssEntry = validateConfigShape(cssConfig as unknown as Configuration)
if (cssEntry === null) {
  console.error(
    'webpack-css.config.js defines entry points that are not stored as an EntryObject. Abandoning precompilation work...',
  )
  process.exit(-1)
}

main(jsEntry, cssEntry)
