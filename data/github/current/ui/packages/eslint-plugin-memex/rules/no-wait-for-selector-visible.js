// @ts-check
/**
 * This rule prevents the use of `waitForSelector` with the `visible` option and
 * encourages developers to use expect().toBeVisible() instead, which is more
 * declarative and encourages use of the Locator API which is more robust.
 *
 * For example,
 *
 * ```
 * await page.waitForSelector(_('settings-side-nav'), { state: 'visible' })
 * ```
 *
 * would be marked as invalid, and the suggestion would be to replace it with:
 *
 * ```
 * await expect(page.locator(_('settings-side-nav')).toBeVisible()
 * ```
 *
 * or if it's looking for a particular element, rewrite it to use locators:
 *
 * ```
 * const sideNav = await page.waitForSelector(_('settings-side-nav'), { state: 'visible' })
 * ```
 *
 * would be replaced with
 *
 * ```
 * const sideNav = await page.locator(_('settings-side-nav'))
 * await expect(sideNav).toBeVisible()
 * ```
 */

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.Node} Node
 */

/**
 * Checks that a node has a parent property
 * @param {Omit<Node, 'parent'>} node
 * @returns {node is Node}
 */
const hasParent = node => {
  return 'parent' in node
}

/**
 * @param {Extract<Node, {type: 'CallExpression'} | {type: 'SimpleCallExpression'}>} node
 */
const isWaitForSelectorVisible = node => {
  return (
    node.callee.type === 'MemberExpression' &&
    // check that callee is `page` or `this.page`
    ((node.callee.object.type === 'Identifier' && node.callee.object.name === 'page') ||
      (node.callee.object.type === 'MemberExpression' &&
        node.callee.object.object.type === 'ThisExpression' &&
        node.callee.object.property.type === 'Identifier' &&
        node.callee.object.property.name === 'page')) &&
    'name' in node.callee.property &&
    node.callee.property.name === 'waitForSelector' &&
    node.arguments.length > 0 &&
    node.arguments[1] &&
    node.arguments[1].type === 'ObjectExpression' &&
    node.arguments[1].properties.some(
      prop =>
        prop.type === 'Property' &&
        prop.key.type === 'Identifier' &&
        prop.key.name === 'state' &&
        prop.value.type === 'Literal' &&
        prop.value.value === 'visible',
    )
  )
}

/** @type {RuleModule} */
const mod = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow use of `waitForSelector` with the `visible` option',
    },
    fixable: 'code',
  },
  create(context) {
    return {
      // Searches for code like `const sideNav = await page.waitForSelector(_('...'), { state: 'visible' })`
      VariableDeclaration(node) {
        // Do not support declarations with multiple declarations
        if (node.declarations.length > 1) return
        const decl = node.declarations[0]
        if (!decl?.init) return
        // Do not support a declaration with a non-async initializer
        if (decl.init.type !== 'AwaitExpression') return
        const callExpr = decl.init.argument
        // Only support async call expressions
        if (callExpr.type !== 'CallExpression') return
        if (!hasParent(callExpr)) return
        if (isWaitForSelectorVisible(callExpr)) {
          context.report({
            node,
            message: `Using waitForSelector with the "state: 'visible'" option is discouraged. Use 'expect().toBeVisible()' instead.`,
            fix: fixer => {
              // Use `this.page` if the callee is `this.page`, otherwise use `page`
              const callingText = context.getSourceCode().getText(callExpr.callee)
              const page = callingText.startsWith('this.page') ? 'this.page' : 'page'
              const selector = context.getSourceCode().getText(callExpr.arguments[0])
              if (decl.id.type !== 'Identifier') return null
              const identifier = decl.id.name
              return [
                fixer.replaceText(callExpr.parent, `${page}.locator(${selector})`),
                fixer.insertTextAfter(callExpr.parent, `\nawait expect(${identifier}).toBeVisible()`),
              ]
            },
          })
        }
      },
      // Searches for code like `await page.waitForSelector(_('...'), { state: 'visible' })`
      CallExpression(node) {
        // Bail out if this is an assignment like `const sideNav = await page.waitForSelector(...)`
        if (node.parent.type === 'AwaitExpression' && node.parent.parent.type === 'VariableDeclarator') {
          return
        }
        if (!hasParent(node)) return
        if (node.type === 'NewExpression') return

        if (isWaitForSelectorVisible(node)) {
          context.report({
            node,
            message: `Using waitForSelector with the "state: 'visible'" option is discouraged. Use 'expect().toBeVisible()' instead.`,
            fix: fixer => {
              // Only return a fix if there are no options other than `state: 'visible'`
              const options = node.arguments[1]
              if (!options) return null
              if (!('properties' in options)) return null
              if (options.properties.length > 1) return null
              // Use `this.page` if the callee is `this.page`, otherwise use `page`
              const callingText = context.getSourceCode().getText(node.callee)
              const page = callingText.startsWith('this.page') ? 'this.page' : 'page'
              const selector = context.getSourceCode().getText(node.arguments[0])

              return fixer.replaceText(node, `expect(${page}.locator(${selector})).toBeVisible()`)
            },
          })
        }
      },
    }
  },
}

module.exports = mod
