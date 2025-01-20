/* eslint @typescript-eslint/no-explicit-any: ["off"] */

interface UICommandsWebpackPluginOptions {
  debug?: boolean
  env: string
  generatedPath?: string
  generatedFile?: string
}

export = class UICommandsWebpackPlugin {
  constructor(options: UICommandsWebpackPluginOptions)
  options: UICommandsWebpackPluginOptions
  env: string
  generatedPath: string
  generatedFile: string
  generateFiles(compilation: any, logger: WebpackLogger): Promise<void>
  writeCommandFile(compilation: any, json: UICommandsCollection): Promise<void>
  writeDtsFile(compilation: any, json: UICommandsCollection): Promise<void>
  apply(compiler: any): void
}
