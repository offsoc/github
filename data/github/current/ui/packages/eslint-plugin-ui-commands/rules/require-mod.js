const {chordNodes, getDefaultBindingValue, keyNodes, replaceNodeValue} = require('./utils')

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Use the operating-system agnostic 'Mod' modifier instead of 'Control' or 'Meta' in keybindings.",
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      Property(node) {
        const hotkeyNode = getDefaultBindingValue(context, node)
        if (!hotkeyNode) return

        for (const chordNode of chordNodes(hotkeyNode))
          for (const keyNode of keyNodes(chordNode))
            if (keyNode.value === 'Control' || keyNode.value === 'Meta') {
              context.report({
                loc: keyNode.loc,
                message: "Use 'Mod' instead of 'Control' or 'Meta' in keybindings.",
                fix: fixer => replaceNodeValue(fixer, keyNode, 'Mod'),
              })
            }
      },
    }
  },
}
