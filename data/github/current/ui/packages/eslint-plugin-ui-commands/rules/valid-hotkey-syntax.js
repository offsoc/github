const {chordNodes, getDefaultBindingValue, keyNodes, replaceNodeValue, KEY_SEPARATOR} = require('./utils')

// intentionally lowercase to make this rule more robust
/** @type {Record<string, number>} */
const expectedKeyOrder = {
  mod: 0,
  control: 1,
  alt: 2,
  meta: 3,
  shift: 4,
}

/** @param {string} keyName */
const getSortValue = keyName => expectedKeyOrder[keyName.toLowerCase()] ?? Infinity

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Keybindings must be defined in valid hotkey syntax with standard key order.',
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      Property(node) {
        const hotkeyNode = getDefaultBindingValue(context, node)
        if (!hotkeyNode) return

        for (const chordNode of chordNodes(hotkeyNode)) {
          if (chordNode.value === '') {
            context.report({
              node: hotkeyNode,
              message: "Keybindings cannot contain empty chords (use 'Space' to represent the ' ' key).",
              fix: fixer => fixer.remove(chordNode),
            })
            continue
          }

          const keys = keyNodes(chordNode).map(n => n.value)

          const sortedChordValue = keys.sort((a, b) => getSortValue(a) - getSortValue(b)).join(KEY_SEPARATOR)
          if (sortedChordValue !== chordNode.value)
            context.report({
              node: chordNode,
              message: `Keys in chord '${chordNode.value}' are not in standard order: expected '${sortedChordValue}'.`,
              fix: fixer => replaceNodeValue(fixer, chordNode, sortedChordValue),
            })

          const uniqueKeys = new Set(keys)
          const uniqueKeysArray = Array.from(uniqueKeys)
          if (uniqueKeys.size !== keys.length)
            context.report({
              node: chordNode,
              message: 'Chords cannot contain duplicate keys.',
              fix: fixer => replaceNodeValue(fixer, chordNode, uniqueKeysArray.join(KEY_SEPARATOR)),
            })

          if (uniqueKeys.has(''))
            context.report({
              node: chordNode,
              message:
                "Chords cannot contain empty keys (use 'Plus' to represent the '+' key, and 'Space' to represent the ' ' key).",
              fix: fixer => replaceNodeValue(fixer, chordNode, keys.filter(key => key !== '').join(KEY_SEPARATOR)),
            })

          // using unique keys here avoids unecessary double-reporting on duplicate non-modifier keys
          // ignore empty strings to avoid unecessary double-reporting with empty key rule
          const nonModKeyCount = uniqueKeysArray.filter(key => getSortValue(key) === Infinity && key !== '').length
          if (nonModKeyCount !== 1)
            context.report({
              node: chordNode,
              message: 'Exactly one non-modifier key is required in a chord.',
            })
        }
      },
    }
  },
}
