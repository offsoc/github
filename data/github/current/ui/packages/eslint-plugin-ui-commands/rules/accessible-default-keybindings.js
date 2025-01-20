/**
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').SimpleLiteral & {
 *   value: string;
 *   range: [number, number];
 *   loc: import('estree').SourceLocation
 * }} StringLiteral A string node. Range & loc are required because it is used by the ESLint auto-fixer.
 */

const {getDefaultBindingValue, getBindingConfigObject, chordNodes, keyNodes} = require('./utils')

const MAX_KEYS_IN_CHORD = 4
const BASE_ERROR_MESSAGE = 'Keybinding is not accessible'
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
const NAVIGATION_KEYS = ARROW_KEYS.concat(['Space', 'Home', 'End', 'PageUp', 'PageDown', 'Enter'])
const SCREENREADER_MODIFIERS = ['Insert', 'CapsLock', 'ScrollLock']
const KEYS_BANNED_WITH_MOD = [
  'Space',
  'F4',
  'b',
  'f',
  'g',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'n',
  't',
  'w',
  '[',
  ']',
  'h',
  'd',
  's',
  'o',
  'p',
  'j',
  ',',
  'l',
  'k',
  'Plus',
  '-',
  'q',
  'z',
  'c',
  'v',
  'x',
  'a',
  'r',
  '`',
  'ArrowLeft',
  'ArrowRight',
]

const KEYS_BANNED_WITH_MOD_LIMITED_PERMISSION = ['c', 'a']
const KEYS_BANNED_WITH_MOD_SHIFT = ['G', 'N', 'T', 'W', 'H', 'D', 'Z', 'R', 'Delete'].concat(ARROW_KEYS)
const FUNCTION_KEYS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']
const SITEWIDE_COMMANDS_JSON_FILEPATH = 'ui/packages/ui-commands/commands.json'

/**
 * @param {RuleContext} context
 * @param {StringLiteral} chord
 * @returns null
 */
function reportDefaultOverrideError(context, chord) {
  context.report({
    node: chord,
    message: `${BASE_ERROR_MESSAGE}: Don't override default operating system shortcuts which are commonly-used.`,
  })
}

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Default command keybindings must be accessible. See https://github.com/github/accessibility/blob/main/docs/coaching-recommendations/keyboard-shortcuts/inaccessible-default-keyboard-shortcuts.md for more details.`,
    },
    schema: [],
  },

  create(context) {
    return {
      Property(node) {
        const hotkeyNode = getDefaultBindingValue(context, node)
        if (!hotkeyNode) return

        for (const chord of chordNodes(hotkeyNode)) {
          const keyValuesSet = new Set(keyNodes(chord).map(keyNode => keyNode.value))
          if (keyValuesSet.size > MAX_KEYS_IN_CHORD) {
            context.report({
              node: chord,
              message: `${BASE_ERROR_MESSAGE}: Chords should consist of ${MAX_KEYS_IN_CHORD} or fewer physical keys being pressed simultaneously.`,
            })
          }
          checkHighPriorityShortcutOverrides(context, chord, keyValuesSet)
          checkKeyboardNavigationOverrides(context, chord, keyValuesSet)
          checkScreenreaderCommandOverrides(context, chord, keyValuesSet)
        }
      },
    }
  },
}
/**
 *
 * @param {import("eslint").Rule.RuleContext} context
 * @param {import('./utils').StringLiteral} chord
 * @param {Set<string>} keyValuesSet
 */
function checkHighPriorityShortcutOverrides(context, chord, keyValuesSet) {
  if (keyValuesSet.has('Alt')) {
    if (keyValuesSet.size == 2) {
      context.report({
        node: chord,
        message: `${BASE_ERROR_MESSAGE}: Alt should not be the sole modifier in a keybinding.`,
      })
    }
  }
  // Not sure anyone will actually try this, but you never know!
  if (keyValuesSet.has('Windows')) {
    context.report({
      node: chord,
      message: `${BASE_ERROR_MESSAGE}: The Windows key is always reserved for the operating system.`,
    })
  }
  if (keyValuesSet.has('Mod') && keyValuesSet.size == 2) {
    const alwaysBannedModKeys = KEYS_BANNED_WITH_MOD.filter(
      key => !KEYS_BANNED_WITH_MOD_LIMITED_PERMISSION.includes(key),
    )
    for (const key of alwaysBannedModKeys) {
      if (keyValuesSet.has(key)) {
        reportDefaultOverrideError(context, chord)
      }
    }

    for (const key of KEYS_BANNED_WITH_MOD_LIMITED_PERMISSION) {
      if (keyValuesSet.has(key)) {
        if (context.getPhysicalFilename() === SITEWIDE_COMMANDS_JSON_FILEPATH) {
          reportDefaultOverrideError(context, chord)
        }

        // validate that mod+c and mod+a are set to expected copy and select behaviors, and are not in the global set
        const commandConfig = getBindingConfigObject(context, chord.value)
        if (keyValuesSet.has('c')) {
          const isCopyBehavior = validatePrefixedNameDescription(commandConfig, 'Copy')
          if (!isCopyBehavior) {
            reportDefaultOverrideError(context, chord)
          }
        }

        if (keyValuesSet.has('a')) {
          const isSelectAllBehavior = validatePrefixedNameDescription(commandConfig, 'Select All')
          if (!isSelectAllBehavior) {
            reportDefaultOverrideError(context, chord)
          }
        }
      }
    }
  }
  if (keyValuesSet.has('Mod') && keyValuesSet.has('Shift') && keyValuesSet.size == 3) {
    for (const key of KEYS_BANNED_WITH_MOD_SHIFT) {
      if (keyValuesSet.has(key)) {
        reportDefaultOverrideError(context, chord)
      }
    }
  }
  if (chord.value === 'ContextMenu' || chord.value === 'Shift+F10') {
    context.report({
      node: chord,
      message: `${BASE_ERROR_MESSAGE}: Don't override the browser context menu.`,
    })
  }
  for (const functionKey of FUNCTION_KEYS) {
    if (chord.value === functionKey) {
      context.report({
        node: chord,
        message: `${BASE_ERROR_MESSAGE}: Function keys without modifiers are reserved by Windows.`,
      })
    }
  }
  // one-offs
  if (chord.value === 'Shift+F3' || chord.value === 'Mod+Alt+b') {
    reportDefaultOverrideError(context, chord)
  }
}

/**
 *
 * @param {import("eslint").Rule.RuleContext} context
 * @param {import('./utils').StringLiteral} chord
 * @param {Set<string>} keyValuesSet
 */
function checkKeyboardNavigationOverrides(context, chord, keyValuesSet) {
  const keyboardNavErrorMessage = `${BASE_ERROR_MESSAGE}: Do not override standard keyboard navigation using commands.`
  if (keyValuesSet.has('Tab') || keyValuesSet.has('Escape')) {
    context.report({
      node: chord,
      message: keyboardNavErrorMessage,
    })
  }
  if (keyValuesSet.size == 1) {
    for (const navigationKey of NAVIGATION_KEYS) {
      if (keyValuesSet.has(navigationKey)) {
        context.report({
          node: chord,
          message: keyboardNavErrorMessage,
        })
      }
    }
  }

  if (keyValuesSet.size == 2 && keyValuesSet.has('Mod')) {
    for (const arrowKey of ARROW_KEYS) {
      if (keyValuesSet.has(arrowKey)) {
        context.report({
          node: chord,
          message: keyboardNavErrorMessage,
        })
      }
    }
  }
}

/**
 *
 * @param {import("eslint").Rule.RuleContext} context
 * @param {import('./utils').StringLiteral} chord
 * @param {Set<string>} keyValuesSet
 */
function checkScreenreaderCommandOverrides(context, chord, keyValuesSet) {
  const screenreaderCommandErrorMessage = `${BASE_ERROR_MESSAGE}: Do not override common screen reader commands or use keys screen readers use as modifiers.`
  for (const modifier of SCREENREADER_MODIFIERS) {
    if (keyValuesSet.has(modifier)) {
      context.report({
        node: chord,
        message: screenreaderCommandErrorMessage,
      })
    }
  }
  // Specific VoiceOver commands
  if (keyValuesSet.has('Control') && keyValuesSet.has('Alt')) {
    context.report({
      node: chord,
      message: screenreaderCommandErrorMessage,
    })
  }
  if (chord.value === 'Mod+F5') {
    context.report({
      node: chord,
      message: screenreaderCommandErrorMessage,
    })
  }
}

/**
 * Takes a command's configuration and validates that the name and description
 * both begin with the expected prefix. We're using this to validate that some default
 * OS keybindings are set to reasonably expected behavior.
 * @example
 * return true
 * validatePrefixedNameDescription({name: 'Copy', description: 'Copy'}, 'Copy')
 * @example
 * return false
 * validatePrefixedNameDescription({name: 'Jump to line', description: 'Jump to line'}, 'Select All')
 * @param {import('./utils').CommandConfig} commandConfig
 * @param {string} prefixString
 * @returns {boolean}
 */
function validatePrefixedNameDescription(commandConfig, prefixString) {
  const name = commandConfig.name?.toLowerCase()
  const description = commandConfig.description?.toLowerCase()
  const validNameIfExist = name?.startsWith(prefixString.toLowerCase())
  const validDescriptionIfExist = description?.startsWith(prefixString.toLowerCase())
  return !!validNameIfExist && !!validDescriptionIfExist
}
