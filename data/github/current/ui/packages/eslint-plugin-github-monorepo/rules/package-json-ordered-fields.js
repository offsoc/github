// @ts-check
const orderHash = require('../helpers/order-hash')

const FIELDS = ['dependencies', 'devDependencies', 'exports', 'scripts']

/**
 *
 * @param {Record<string, unknown>} obj
 * @returns {boolean}
 */
const isSorted = obj => {
  const arr = Object.keys(obj)
  return arr.slice(1).every((item, i) => (arr[i] || '').toLowerCase() <= item.toLowerCase())
}

/**
 * @param {import('estree').Expression} node
 * @returns {node is import('estree').Literal & {value: string}}
 */
const isSortedFieldKey = node =>
  node.type === 'Literal' && typeof node.value === 'string' && FIELDS.includes(node.value)

/**
 * Indent all but the first line of a string.
 * @param {string} value
 * @param {number} depth
 */
const hangingIndent = (value, depth) =>
  value
    .split('\n')
    .map((l, i) => (i === 0 ? l : `${' '.repeat(depth)}${l}`))
    .join('\n')

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Monorepo packages require package.json's (${FIELDS.join(',')}) fields to be ordered.`,
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      Property(node) {
        if (!isSortedFieldKey(node.key)) return

        const valueNode = node.value
        if (valueNode.type !== 'ObjectExpression') return

        const value = JSON.parse(context.getSourceCode().getText(valueNode))
        if (isSorted(value)) return

        context.report({
          node: valueNode,
          message: `Field "${node.key.value}" must be sorted alphabetically`,
          fix: fixer => fixer.replaceText(valueNode, hangingIndent(JSON.stringify(orderHash(value), null, 2), 2)),
        })
      },
    }
  },
}

module.exports = rule
