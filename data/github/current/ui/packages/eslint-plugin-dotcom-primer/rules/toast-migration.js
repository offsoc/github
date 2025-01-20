const message =
  'Toasts degrade the overall user experience and are therefore considered a discouraged pattern. Please consider using alternatives as described in: https://primer.style/ui-patterns/notification-messaging. If you have any questions, reach out in #primer.'

// @ts-check
/**
 * This rule prevents the addToast and addPersistedToast functions from being used.
 * Toasts have accessibility and usability issue.
 */

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.Node} Node
 */

/** @type {RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: message,
      url: 'https://github.com/github/primer/discussions/3080',
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        const {callee} = node
        if (callee.type === 'Identifier' && (callee.name === 'addToast' || callee.name === 'addPersistedToast')) {
          context.report({
            node,
            message,
          })
        } else if (
          callee.type === 'MemberExpression' &&
          (callee.property.name === 'addToast' || callee.property.name === 'addPersistedToast')
        ) {
          context.report({
            node,
            message,
          })
        }
      },
    }
  },
}
