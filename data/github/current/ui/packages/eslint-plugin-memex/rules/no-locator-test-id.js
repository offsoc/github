// @ts-check
/**
 * This rule prevents the use of `locator(_(...))` and encourages developers to
 * use `getByTestId(...)` instead, which is more clear and requires less code.
 *
 * For example,
 *
 * ```
 * const sidePanel = page.locator(_('side-panel'))
 * ```
 *
 * would be marked as invalid, and the suggestion would be to replace it with:
 *
 * ```
 * const sidePanel = page.getByTestId('side-panel')
 * ```
 */

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.Node} Node
 */

/** @type {RuleModule} */
const mod = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow use of `locator(_())` rather than `getByTestId()`',
    },
    fixable: 'code',
  },
  create(context) {
    return {
      CallExpression(node) {
        // Should be something like `x.y.z`
        if (node.callee.type !== 'MemberExpression') return

        const {object, property} = node.callee

        // The calling function should be an identifier called `locator`
        if (property.type !== 'Identifier' || property.name !== 'locator') return

        // The first argument to `locator` should be a function called `_`
        if (node.arguments.length !== 1) return
        const arg = node.arguments[0]
        if (!arg) return
        if (arg.type !== 'CallExpression') return
        if (arg.callee.type !== 'Identifier' || arg.callee.name !== '_') return

        // The first argument to `_` should be a string literal or template literal
        if (arg.arguments.length !== 1) return
        const testId = arg.arguments[0]
        if (!testId) return
        if (testId.type !== 'Literal' && testId.type !== 'TemplateLiteral') return

        const src = context.getSourceCode()

        context.report({
          node,
          message: 'Use `getByTestId(...)` instead of `locator(_(...))`.',
          fix(fixer) {
            return fixer.replaceText(node, `${src.getText(object)}.getByTestId(${src.getText(testId)})`)
          },
        })
      },
    }
  },
}

module.exports = mod
