/**
 * This custom webpack plugin is responsible for adding a displayName to all React components.
 *
 * Example Input
 *
 * function Diff() {...}
 *
 * Example Output (replaces the import above)
 *
 * function Diff() {...}
 * try{ Diff.displayName = 'Diff' } catch {}
 */

const reactComponentMatcher = /(const|function) ([A-Z]\w*).*\(/g

module.exports = function reactDisplayNameLoader(source) {
  let displayNameSetters = ''

  for (const match of source.matchAll(reactComponentMatcher)) {
    const [, , componentName] = match

    // Do not override an existing displayName
    if (source.includes(`${componentName}.displayName`)) {
      continue
    }

    /**
     * Set the display name, but do so in a try/catch block in case this is a functional component or it
     * isn't in the global scope. We could be more specific if we used AST, but this approach gets us close.
     */
    displayNameSetters += `
try{ ${componentName}.displayName ||= '${componentName}' } catch {}`
  }

  return source + displayNameSetters
}
