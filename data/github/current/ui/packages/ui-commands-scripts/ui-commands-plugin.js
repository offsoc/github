const {resolve} = require('node:path')
const glob = require('glob')
const generateFiles = require('./write-command-files')

const UI_COMMANDS_GENERATED_PATH = 'ui/packages/ui-commands/__generated__'
const UI_COMMANDS_GENERATED_FILE = 'ui-commands'
const PLUGIN_NAME = 'github:UICommandsWebpackPlugin'

const rootPath = resolve(__dirname, '../../../')

module.exports = class UICommandsWebpackPlugin {
  options
  env
  generatedPath
  generatedFile

  constructor(options) {
    this.options = options
    this.env = options.env
    this.generatedPath = options.generatedPath ?? UI_COMMANDS_GENERATED_PATH
    this.generatedFile = options.generatedFile ?? UI_COMMANDS_GENERATED_FILE
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async () => {
      await generateFiles(rootPath, compiler.getInfrastructureLogger(PLUGIN_NAME), {
        path: this.generatedPath,
        file: this.generatedFile,
        env: this.env,
      })
    })

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const logger = compilation.getLogger(PLUGIN_NAME)

      const commandsPath = resolve(rootPath, 'ui/packages/*/commands.json')
      const testCommandsPath = resolve(rootPath, 'ui/packages/*/commands.test.json')

      // extract (flatten) all files from all input list and add to file watch.
      const files = [...glob.sync(commandsPath), ...(this.env === 'production' ? [] : glob.sync(testCommandsPath))]

      for (const file of files) {
        if (!compilation.fileDependencies.has(file)) {
          logger.debug('Adding file dependency:', file)
          compilation.fileDependencies.add(file)
        }
      }
    })
  }
}
