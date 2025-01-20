// Register swc-node as the require hook so we can use TypeScript in our generators
const {register} = require('@swc-node/register/register')
register({
  module: {
    type: 'commonjs',
  },
})

const {addLineToFile} = require('./generators/actions/add-line-to-file')
const {openFile} = require('./generators/actions/open-file')
const {runCommand} = require('./generators/actions/run-command')
const {registerReactAppGenerator} = require('./generators/react-app')
const {registerReactPartialGenerator} = require('./generators/react-partial')
const {registerReactComponentGenerator} = require('./generators/react-component')
const {registerReactHookGenerator} = require('./generators/react-hook')
const {registerCatalystComponentGenerator} = require('./generators/catalyst-component')
const {registerBuildScriptGenerator} = require('./generators/build-script')
const {registerBasicPackageGenerator} = require('./generators/basic-package')

module.exports = async function plopConfig(plop) {
  plop.setActionType('addLineToFile', addLineToFile)
  plop.setActionType('runCommand', runCommand)
  plop.setActionType('openFile', openFile)

  // Don't register autocomplete prompt in tests. It's esm and throws off jest.
  if (process.env.NODE_ENV !== 'test') {
    const {default: autocomplete} = await import('inquirer-autocomplete-prompt')
    plop.setPrompt('autocomplete', autocomplete)
  }

  registerReactAppGenerator(plop)
  registerReactPartialGenerator(plop)
  registerReactComponentGenerator(plop)
  registerReactHookGenerator(plop)
  registerCatalystComponentGenerator(plop)
  registerBuildScriptGenerator(plop)
  registerBasicPackageGenerator(plop)
}
