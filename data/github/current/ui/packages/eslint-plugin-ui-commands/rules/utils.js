/**
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').SimpleLiteral & {
 *   value: string;
 *   range: [number, number];
 *   loc: import('estree').SourceLocation
 * }} StringLiteral A string node. Range & loc are required because it is used by the ESLint auto-fixer.
 * @typedef {import('estree').Property} Property
 * @typedef {{
 *  name: string
 *  description: string
 *  defaultBinding?: string
 *  featureFlag?: string
 * }} CommandConfig
 */

const CHORD_SEPARATOR = ' '
const KEY_SEPARATOR = '+'

module.exports = {
  getDefaultBindingValue,
  getServiceIdValue,
  getBindingConfigObject,
  chordNodes,
  keyNodes,
  replaceNodeValue,
  getCommandsValue,
  isStringLiteral,
  CHORD_SEPARATOR,
  KEY_SEPARATOR,
}

const commandsJsonRegex = /\/commands\.(?:test\.)?json$/

/**
 * @param {RuleContext} context
 */
function isCommandsMetadataFile(context) {
  return commandsJsonRegex.test(context.getFilename())
}

/**
 * @param {import('estree').Literal["value"]} expectedValue
 * @param {import('estree').Expression} node
 */
function isLiteralValue(expectedValue, node) {
  return node.type === 'Literal' && node.value === expectedValue
}

/**
 * @param {string} expectedKey
 * @param {RuleContext} context
 * @param {import('estree').Property} property
 */
function isCommandsMetadataField(expectedKey, context, property) {
  return isCommandsMetadataFile(context) && isLiteralValue(expectedKey, property.key)
}

/**
 * @param {import('estree').Expression | import('estree').Pattern} node
 * @returns {node is StringLiteral}
 */
function isStringLiteral(node) {
  return node.type === 'Literal' && typeof node.value === 'string' && node.range !== undefined && node.loc !== undefined
}

/**
 * If the property node is in the form `"defaultBinding": "string"`, returns the string value literal of the node.
 * Otherwise returns `null`.
 * @param {RuleContext} context
 * @param {import('estree').Property} property
 */
function getDefaultBindingValue(context, property) {
  return isCommandsMetadataField('defaultBinding', context, property) && isStringLiteral(property.value)
    ? property.value
    : null
}

/**
 * Gets whole binding config object for the provided chord.
 * @example
 * returns {
 *  "name": "Copy",
 *  "description": "Copy",
 *  "defaultBinding": "Mod+C"
 * }
 * getBindingConfigObject(context, "Mod+C")
 * @param {RuleContext} context
 * @param {string} chord
 * @returns {CommandConfig}
 */
function getBindingConfigObject(context, chord) {
  const configObject = {
    name: '',
    description: '',
    defaultBinding: '',
  }

  const topLevelExpressionStatement = context?.getSourceCode()?.ast?.body[0]
  if (
    topLevelExpressionStatement?.type !== 'ExpressionStatement' ||
    topLevelExpressionStatement.expression?.type !== 'ObjectExpression'
  )
    return configObject

  const configuredCommandsObject = topLevelExpressionStatement.expression?.properties?.find(property =>
    isCommandsMetadataField('commands', context, property),
  )?.value

  if (configuredCommandsObject?.type !== 'ObjectExpression') return configObject
  const allConfiguredCommands = configuredCommandsObject.properties

  const thisConfigAST = allConfiguredCommands.find(property => {
    // @ts-expect-error RuleContext as a type doesn't seem to contain all properties
    const thisBinding = property.value.properties.find(property1 => {
      return property1.key.value === 'defaultBinding'
    })
    return thisBinding && thisBinding.value.value === chord
  })?.value
  if (thisConfigAST?.type !== 'ObjectExpression') return configObject

  for (const property of thisConfigAST.properties) {
    const keyNode = property.key
    const valueNode = property.value
    if (!isStringLiteral(keyNode) || !isStringLiteral(valueNode)) return configObject
    const key = keyNode.value
    const value = valueNode.value

    if (key === 'defaultBinding') configObject.defaultBinding = value
    if (key === 'name') configObject.name = value
    if (key === 'description') configObject.description = value
  }

  return configObject
}

/**
 * If the property node is in the form `"serviceId": "string"`, returns the string value literal of the node. Otherwise
 * returns `null`.
 * @param {RuleContext} context
 * @param {import('estree').Property} property
 */
function getServiceIdValue(context, property) {
  return isCommandsMetadataField('serviceId', context, property) && isStringLiteral(property.value)
    ? property.value
    : null
}

/**
 * If the property node is in the form `"commands": {...}`, returns the array of command property nodes. Otherwise
 * returns `null`.
 * @param {RuleContext} context
 * @param {import('estree').Property} property
 */
function getCommandsValue(context, property) {
  return isCommandsMetadataField('commands', context, property) && property.value.type === 'ObjectExpression'
    ? property.value.properties
    : null
}

/**
 * @param {StringLiteral} node
 * @param {string} separator
 */
function splitStringNode(node, separator) {
  if (!node.loc || !node.range) return []

  // We assume the node string is single-line because this came from JSON
  if (node.loc.start.line !== node.loc.end.line) throw new Error('Cannot split string node that crosses multiple lines')

  const line = node.loc.start.line
  const columnStart = node.loc.start.column
  const rangeStart = node.range[0]

  // Skip surrounding quotes if present
  let index = node.raw?.indexOf(node.value) ?? 0

  const chordStrings = node.value.split(separator)

  /** @type {StringLiteral[]} */
  const nodes = []

  for (const [i, chordStr] of chordStrings.entries()) {
    const isLast = i === chordStrings.length - 1
    // Include the separator so it is included as part of fixes (ie, removal)
    const length = chordStr.length + (isLast ? 0 : separator.length)

    nodes.push({
      type: 'Literal',
      value: chordStr,
      raw: isLast ? chordStr : `${chordStr}${separator}`,
      loc: {
        start: {
          line,
          column: columnStart + index,
        },
        end: {
          line,
          column: columnStart + index + length,
        },
      },
      range: [rangeStart + index, rangeStart + index + length],
    })

    index += length
  }

  return nodes
}

/**
 * @param {StringLiteral} hotkeyStringNode The value of a `defaultBinding` field in a `commands.json` file, including
 * surrounding quotation marks.
 */
function chordNodes(hotkeyStringNode) {
  return splitStringNode(hotkeyStringNode, CHORD_SEPARATOR)
}

/**
 * @param {StringLiteral} chordStringNode Node from `chordNodes'.
 */
function keyNodes(chordStringNode) {
  return splitStringNode(chordStringNode, KEY_SEPARATOR)
}

/**
 * Replace only the value in a node, keeping any surrounding syntax like the joining `+`.
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {StringLiteral} keyNode
 * @param {string} replacementKey
 */
function replaceNodeValue(fixer, keyNode, replacementKey) {
  return fixer.replaceText(keyNode, keyNode.raw?.replace(keyNode.value, replacementKey) ?? replacementKey)
}
