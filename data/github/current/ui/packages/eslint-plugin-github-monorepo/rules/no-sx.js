// @ts-check

const {ESLintUtils} = require('@typescript-eslint/utils')
/** @typedef {import('@typescript-eslint/types').TSESTree.JSXAttribute} JSXAttribute */

const propNameRegex = /[Ss]x$/

const typeNames = new Set(['SxProp', 'BetterSystemStyleObject'])

module.exports = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    docs: {
      description:
        'GitHub is migrating from styled-system to CSS Modules. As packages are migrated, they can enable this rule to prevent regression.',
    },
    messages: {
      noSx: 'This package has migrated to CSS Modules. Instead of styling with `sx`, add styles to the corresponding `module.css` file and use `className` for selection.',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // This rule is fairly naive: we just ban all props and identifiers with common `sx` names. These props are pretty
    // distinctive so this should be safe enough.
    return {
      JSXAttribute(node) {
        if (node.name.type === 'JSXIdentifier' && propNameRegex.test(node.name.name))
          context.report({messageId: 'noSx', node})
      },
      Identifier(node) {
        if (typeNames.has(node.name)) context.report({messageId: 'noSx', node})
      },
    }
  },
})
