const path = require('path')
const {globFromRoot} = require('../path-utils')

/**
 * This custom webpack plugin is responsible for setting up dynamic imports for alloy/ssr entry points.
 * Any package within ui/packages with an `ssr-entry.ts` should get automatically included in the alloy bundle.
 *
 * Example Input:
 *
 * /* Insert dynamic ssr-entry.ts imports here *\/
 *
 * Example Output (replaces the comment above):
 *
 * import './ui/packages/notification-settings/alloy-import'
 * ....
 */

const importPlaceholder = '/* Insert dynamic ssr-entry.ts imports here */'

module.exports = function dynamicElementsLoader(source) {
  if (!source.includes(importPlaceholder)) {
    console.error(`Dynamic alloy loader: no placeholder found for file ${this.resourcePath}`)
    return source
  }

  const dynamicImports = globFromRoot('ui/packages/*/ssr-entry.ts').map(file => {
    // use a relative path so that sourcemaps are the same in all build environments
    const relativePath = path.relative(this.context, file)
    return `import '${relativePath}'`
  })

  const output = dynamicImports.join('\n')
  return source.replace(importPlaceholder, output)
}
