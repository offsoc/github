const {chordNodes, getDefaultBindingValue, keyNodes, replaceNodeValue} = require('./utils')

const validNamedKeys = [
  'Escape',
  'Tab',
  'Backspace',
  'Enter',
  'CapsLock',
  'Insert',
  'Home',
  'End',
  'Delete',
  'PageUp',
  'PageDown',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'Control',
  'Meta',
  'Mod',
  'Shift',
  'Alt',
  'Plus',
  'Space',
]

const namedKeysByLowercase = new Map(validNamedKeys.map(key => [key.toLowerCase(), key]))

/** [lowercase, uppercase] */
const validCharacterKeys = /** @type {const} */ ([
  ['`', '~'],
  ['1', '!'],
  ['2', '@'],
  ['3', '#'],
  ['4', '$'],
  ['5', '%'],
  ['6', '^'],
  ['7', '&'],
  ['8', '*'],
  ['9', '('],
  ['0', ')'],
  ['-', '_'],
  ['=', 'Plus'],
  ['q', 'Q'],
  ['w', 'W'],
  ['e', 'E'],
  ['r', 'R'],
  ['t', 'T'],
  ['y', 'Y'],
  ['u', 'U'],
  ['i', 'I'],
  ['o', 'O'],
  ['p', 'P'],
  ['[', '{'],
  [']', '}'],
  ['\\', '|'],
  ['a', 'A'],
  ['s', 'S'],
  ['d', 'D'],
  ['f', 'F'],
  ['g', 'G'],
  ['h', 'H'],
  ['j', 'J'],
  ['k', 'K'],
  ['l', 'L'],
  [';', ':'],
  ["'", '"'],
  ['z', 'Z'],
  ['x', 'X'],
  ['c', 'C'],
  ['v', 'V'],
  ['b', 'B'],
  ['n', 'N'],
  ['m', 'M'],
  [',', '<'],
  ['.', '>'],
  ['/', '?'],
  ['Space', 'Space'],
])

/** Keys which, when used with `Alt`, are `Dead` modifiers (https://en.wikipedia.org/wiki/Dead_key). */
const deadKeys = ['`', 'e', 'u', 'i', 'n']

/** @type {Map<string, string>} */
const characterKeysByLowercase = new Map(validCharacterKeys)

/** @type {Map<string, string>} */
const characterKeysByUppercase = new Map(validCharacterKeys.map(([lc, uc]) => [uc, lc]))

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Only valid key names (present on a US English QWERTY keyboard, aka a US ANSI 104-key layout) should be used in keybindings.',
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
          for (const keyNode of keyNodes(chordNode)) {
            if (keyNode.value.length > 1) {
              // named key

              const lowercaseValue = keyNode.value.toLowerCase()
              const correctValue = namedKeysByLowercase.get(lowercaseValue)

              // Try to help with common mistakes first
              if (lowercaseValue === 'option' || lowercaseValue === 'opt')
                context.report({
                  node: keyNode,
                  message: `Unknown key name '${keyNode.value}': the correct name of the MacOS 'Option' modifier key is 'Alt'.`,
                  fix: fixer => replaceNodeValue(fixer, keyNode, 'Alt'),
                })
              else if (lowercaseValue === 'command' || lowercaseValue === 'cmd')
                context.report({
                  node: keyNode,
                  message: `Unknown key name '${keyNode.value}': the correct name of the MacOS 'Command' modifier key is 'Meta'.`,
                  fix: fixer => replaceNodeValue(fixer, keyNode, 'Meta'),
                })
              else if (lowercaseValue === 'esc')
                context.report({
                  node: keyNode,
                  message: `Unknown key name '${keyNode.value}': use the full name of the 'Escape' key.`,
                  fix: fixer => replaceNodeValue(fixer, keyNode, 'Escape'),
                })
              else if (lowercaseValue === 'ctrl')
                context.report({
                  node: keyNode,
                  message: `Unknown key name '${keyNode.value}': use the full name of the 'Control' key.`,
                  fix: fixer => replaceNodeValue(fixer, keyNode, 'Control'),
                })
              else if (!correctValue)
                context.report({
                  node: keyNode,
                  message: `Unknown key name '${keyNode.value}'.`,
                })
              else if (correctValue !== keyNode.value)
                context.report({
                  node: keyNode,
                  message: `Key names are case-sensitive: use '${correctValue}' instead of '${keyNode.value}'.`,
                  fix: fixer => replaceNodeValue(fixer, keyNode, correctValue),
                })
            } else if (keyNode.value.length === 1 || keyNode.value === 'Plus' || keyNode.value === 'Space') {
              // character key (Plus and Space are _both_ named and character keys)

              const shouldBeUppercase = chordNode.value.includes('Shift')

              if (!characterKeysByLowercase.has(keyNode.value) && !characterKeysByUppercase.has(keyNode.value))
                context.report({
                  node: keyNode,
                  message: `Unknown key name '${keyNode.value}'. Character keys must be present on a US English QWERTY layout.`,
                })
              else if (shouldBeUppercase && characterKeysByLowercase.has(keyNode.value))
                context.report({
                  node: keyNode,
                  message: "When 'Shift' is a modifier, the target key must be uppercase.",
                  fix: fixer =>
                    replaceNodeValue(fixer, keyNode, characterKeysByLowercase.get(keyNode.value) ?? keyNode.value),
                })
              else if (!shouldBeUppercase && characterKeysByUppercase.has(keyNode.value))
                context.report({
                  node: keyNode,
                  message: "The target key must be lowercase unless 'Shift' is a modifier.",
                  fix: fixer =>
                    replaceNodeValue(fixer, keyNode, characterKeysByUppercase.get(keyNode.value) ?? keyNode.value),
                })
              else if (chordNode.value.includes('Alt') && deadKeys.includes(keyNode.value))
                context.report({
                  node: chordNode,
                  message: `${deadKeys
                    .map(k => `'Alt+${k}'`)
                    .join(
                      ', ',
                    )} produce 'Dead' keys (https://en.wikipedia.org/wiki/Dead_key) and cannot be used as shortcuts.`,
                })
            }
            // don't worry about empty strings since that's invalid syntax
          }
      },
    }
  },
}
