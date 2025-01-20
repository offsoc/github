const packageNameMatcher = /\/ui\/packages\/([^/]+)/

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'React Partials must have the same name as the package they are in.',
    },
    hasSuggestions: true,
  },

  create(context) {
    const fileName = context.getFilename()
    const packageNameMatch = fileName.match(packageNameMatcher)
    if (!packageNameMatch) return {}

    return {
      CallExpression(node) {
        const {callee, arguments} = node
        if (callee.type === 'Identifier' && callee.name === 'registerReactPartial') {
          const firstArg = arguments[0]?.value
          const partialName = typeof firstArg === 'string' ? firstArg : null

          const packageName = packageNameMatch[1]

          if (partialName === packageName) return

          context.report({
            node: arguments[0],
            message: 'React partials must have the same name as the package they are registered in.',
            suggest: [
              {
                fix: fixer => fixer.replaceText(arguments[0], `'${packageName}'`),
                desc: 'Rename the partial to match the package name.',
              },
            ],
          })
        }
      },
    }
  },
}

module.exports = rule
