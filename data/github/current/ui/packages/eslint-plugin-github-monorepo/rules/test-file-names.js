// @ts-check
const TEST_FUNCTIONS = new Set(['describe', 'it', 'test'])
const SUFFIX_REGEX = /^.+\.test\.tsx?$/
/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Jest test files should have a .test.ts or .test.tsx suffix.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        const {callee} = node
        if (callee.type === 'Identifier' && TEST_FUNCTIONS.has(callee.name)) {
          const fileName = context.getFilename()
          if (fileName.match(SUFFIX_REGEX)) return
          context.report({
            node,
            message: 'Jest test files should have a .test.ts or .test.tsx suffix.',
          })
        }
      },
    }
  },
}

module.exports = rule
