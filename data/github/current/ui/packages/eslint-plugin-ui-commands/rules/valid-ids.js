const {replaceNodeValue, getServiceIdValue, getCommandsValue, isStringLiteral} = require('./utils')

const validIdRegex = /^[a-z][a-z0-9-]+$/

// Only attempt to fix basic casing problems, not things like invalid symbols
const fixableIdRegex = /^[a-z][a-z0-9_-]+$/i

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use kebab-casing for command and service IDs.',
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      Property(node) {
        const serviceId = getServiceIdValue(context, node)
        const commandIds =
          getCommandsValue(context, node)
            ?.map(n => n.key)
            .filter(isStringLiteral) ?? []

        const allIds = serviceId ? [serviceId, ...commandIds] : commandIds

        for (const idNode of allIds)
          if (idNode.value === '')
            context.report({
              message: 'ID cannot be empty.',
              node: idNode,
            })
          else if (!validIdRegex.test(idNode.value))
            context.report({
              message: `Invalid ID: Command and service IDs must consist only of alphanumeric characters and hyphens.`,
              node: idNode,
              fix: fixableIdRegex.test(idNode.value)
                ? fixer => {
                    const replacement = idNode.value
                      // lowercase initial cap
                      .replace(/^[A-Z]/, c => c.toLowerCase())
                      // replace internal caps with kebabs and lowercase
                      .replaceAll(/[A-Z]/g, c => `-${c.toLowerCase()}`)
                      // replace underscores with kebabs
                      .replaceAll('_', '-')

                    return replaceNodeValue(fixer, idNode, replacement)
                  }
                : undefined,
            })
      },
    }
  },
}
