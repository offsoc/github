/**
 * This custom webpack plugin wraps the primer/react css modules in a `@layer primer-react` directive.
 */

module.exports = function primerReactCssLayerLoader(source) {
  if (source === undefined) {
    return undefined
  }
  return `@layer primer-react { ${source} }`
}
