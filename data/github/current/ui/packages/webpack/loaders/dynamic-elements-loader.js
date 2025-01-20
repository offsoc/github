const path = require('path')
const glob = require('glob')

/**
 * This custom webpack plugin is responsible for setting up dynamic imports for all custom elements located in
 * app/components or ui/packages. We expect this plugin to only be run in a single place (element-registry.ts),
 * and for the `lazyDefine` function to be present in the file before this import statement
 *
 *
 * Example Input
 *
 * import 'plugin:dynamic-elements'
 *
 *
 * Example Output (replaces the import above)
 *
 * lazyDefine('auto-playable', () => import('../../components/accessibility/auto-playable-element.ts'));
 * lazyDefine('launch-code', () => import('../../components/account_verifications/launch-code-element.ts'));
 * lazyDefine('action-list', () => import('@github-ui/experimental-action-list-element'));
 * ....
 */

const importMatcher = /.*import ['"]plugin:dynamic-elements['"].*/

module.exports = function dynamicElementsLoader(source) {
  const match = importMatcher.exec(source)

  if (!match) {
    console.error(`Dynamic elements loader: no match found for file ${this.resourcePath}`)
    return source
  }

  const appComponentsPath = path.resolve(this.rootContext, 'app/components/**/*-element.ts')
  const appComponents = glob.sync(appComponentsPath).map(file => {
    const elementName = path.basename(file, '-element.ts')
    // use a relative path so that sourcemaps are the same in all build environments
    const relativePath = path.relative(this.context, file)
    return [elementName, relativePath]
  })

  const uiComponentsPath = path.resolve(this.rootContext, 'ui/packages/*-element/element-entry.ts')
  const uiComponents = glob.sync(uiComponentsPath).map(file => {
    const elementName = path.basename(path.dirname(file), '-element')
    return [elementName, `@github-ui/${elementName}-element`]
  })

  const output = [...appComponents, ...uiComponents]
    .map(([elementName, importPath]) => {
      return `lazyDefine('${elementName}', () => import('${importPath}'))`
    })
    .join('\n')

  return source.replace(/.*plugin:dynamic-elements.*/, output)
}
