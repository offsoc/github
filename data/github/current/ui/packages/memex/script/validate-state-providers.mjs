// @ts-check
import {basename, dirname, relative} from 'path'
import {Project, ts} from 'ts-morph'
import {fileURLToPath} from 'url'

/** @typedef {{kind: 'callback' | 'hook';name: string;path: string;messages: Array<string>;}} OutputMessage */
/** @typedef {'find' | 'get' | 'set' | 'update' | 'remove' | 'delete'} Convention */
/** @typedef {{valid:true, unknown:true} | {valid:true, convention: Convention} | {valid:false, message:string}} ValidationResult */

const __dirname = dirname(fileURLToPath(import.meta.url))

const rootDirectory = dirname(__dirname)

const isVerbose = process.argv.indexOf('--verbose') > 1

/**
 * Convert the AST node into a clickable relative path + line + column string
 * to render in the terminal.
 *
 * @param {import("ts-morph").Node} node
 */
function getPathWithLineNumberAndColumn(node) {
  const sourceFile = node.getSourceFile()
  const fullPath = sourceFile.getFilePath()
  const relativePath = relative(rootDirectory, fullPath)
  const {line, column} = sourceFile.getLineAndColumnAtPos(node.getStart())

  return `${relativePath}:${line}:${column}`
}

/**
 * A callback prefixed with `find` is permitted to:
 *
 * - find existing client-side state (e.g. `find[Something]`)
 *
 *  @type {Set<Convention>}
 */
const findConventions = new Set(['find'])

/**
 * A callback prefixed with `set` is permitted to:
 *
 * - find existing client-side state (e.g. `find[Something]`)
 * - update client-side state to apply local changes (e.g. `set[Something]`)
 *
 *  @type {Set<Convention>}
 */
const setConventions = new Set([...findConventions.values(), 'set'])

/**
 * A callback prefixed with `get` is permitted to:
 *
 * - find existing client-side state (e.g. `find[Something]`)
 * - update client-side state to refresh caching (e.g. `set[Something]`)
 * - interact with the backend (e.g. `get[Something]`)
 *
 *  @type {Set<Convention>}
 */
const getConventions = new Set([...setConventions.values(), 'get'])

/**
 * A callback prefixed with `update` is permitted to:
 *
 * - find existing client-side state (e.g. `find[Something]`)
 * - update client-side state to refresh caching (e.g. `set[Something]`)
 * - retrieve data from the backend (e.g. `get[Something]`)
 * - mutate data on the backend (e.g. `update[Something]`)
 *
 *  @type {Set<Convention>}
 *
 */
const updateConventions = new Set([...getConventions.values(), 'update'])

/**
 * A callback prefixed with `remove` is permitted to:
 *
 * - find existing client-side state (e.g. `find[Something]`)
 * - update client-side state to refresh caching (e.g. `set[Something]`)
 * - delete client-side data on the backend (e.g. `remove[Something]`)
 *
 * @type {Set<Convention>}
 */
const removeConventions = new Set([...setConventions.values(), 'remove'])

/**
 * A callback prefixed with `delete` is permitted to:
 *
 * - find existing client-side state (e.g. `find[Something]`)
 * - update client-side state to refresh caching (e.g. `set[Something]`)
 * - retrieve data from the backend (e.g. `get[Something]`)
 * - mutate data on the backend (e.g. `delete[Something]`)
 * - delete client-side data on the backend (e.g. `remove[Something]`)
 *
 * @type {Set<Convention>}
 */
const deleteConventions = new Set([...removeConventions.values(), 'delete'])

/**
 * Helper method to obtain the convention set based on a given prefix
 *
 * @param {Convention} prefix
 */
function getConventionsForPrefix(prefix) {
  switch (prefix) {
    case 'get':
      return getConventions
    case 'set':
      return setConventions
    case 'find':
      return findConventions
    case 'update':
      return updateConventions
    case 'delete':
      return deleteConventions
    case 'remove':
      return removeConventions
    default:
      throw new Error(`Invalid prefix: '${prefix}'`)
  }
}

/**
 * Return a list of files to scan for hooks associated with state providers
 *
 * @param {Project} project the frontend project relating to `src/client/`
 */
function findStateProviderFiles(project) {
  return project.getSourceFiles('src/client/state-providers/**')
}

/**
 * Locate the `VariableDeclaration` node associated with the property of a
 * return type.
 *
 * For example, this return type has a property named `archiveMemexItems`
 *
 * ```
 * return {archiveMemexItems}
 * ```
 *
 * This will look for a corresponding variable within the current block:
 *
 * const archiveMemexItems = / some code here/
 *
 * @param {import('ts-morph').Block} block the AST of the contents of the hook
 * @param {string} variableName the variable name to locate
 *
 * @returns {import('ts-morph').VariableDeclaration | undefined}
 */
function findVariableDeclaration(block, variableName) {
  const variables = block.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration)
  for (const variable of variables) {
    const name = variable.getName()
    if (name === variableName) {
      return variable
    }
  }
}

/**
 * Convert the callback name into a prefix (if it matches our known conventions)
 * or return `null` if a different name was found.
 *
 * @param {string} str the variable name defined in the hook
 *
 * @returns {Convention | null}
 */
function extractHookPrefixConvention(str) {
  const matches = str.match(/[a-z]*[A-Z]/)
  if (!matches) {
    return null
  }

  const firstMatch = matches[0]
  const firstWord = firstMatch.substring(0, firstMatch.length - 1)
  switch (firstWord) {
    case 'find':
    case 'get':
    case 'set':
    case 'update':
    case 'remove':
    case 'delete':
      return firstWord
    default:
      return null
  }
}

/**
 * Generate an error message about the conventions for this hook method not
 * being satisfied
 *
 * @param {string} callbackName the callback that does not match with it's expected internals
 * @param {Set<Convention>} conventions the designated conventions that it should be following
 */
function callbackDoesNotMatchConventionsMessage(callbackName, conventions) {
  return ` - ❌ found callback '${callbackName}' which does not match allowed conventions\n    - expected prefix to be one of: ${[
    ...conventions.values(),
  ]
    .map(p => `'${p}'`)
    .join(', ')}`
}

/**
 * Assert the callback matches the conventions defined by the parent hook
 *
 * @param {Convention | null} conventionPrefix the callback to assert
 * @param {Set<Convention>} conventions the designated conventions that it should be following
 * @param {string} nodeText the text to display as part of any user-facing messaging
 *
 * @returns {ValidationResult}
 */
function validateName(conventionPrefix, conventions, nodeText) {
  if (!conventionPrefix) {
    return {
      valid: true,
      unknown: true,
    }
  }

  if (conventions.has(conventionPrefix)) {
    return {valid: true, convention: conventionPrefix}
  }

  return {
    valid: false,
    message: callbackDoesNotMatchConventionsMessage(nodeText, conventions),
  }
}

/**
 * Convert the validation result into a user-friendly message
 *
 * @param {ValidationResult} result a validation message
 * @param {string} nodeText the text to display for the node
 */
function convertResultToMessage(result, nodeText) {
  if (!result.valid && 'message' in result) {
    return result.message
  }

  if (!isVerbose) {
    return null
  }

  if (result.valid && 'unknown' in result && result.unknown) {
    return ` - 🌫  Found call ${nodeText} which is not in scope`
  }

  if (result.valid && 'convention' in result) {
    return ` - ✅ Found call ${nodeText} which matches convention: '${result.convention}'`
  }
}

/**
 * Enumerate the `CallExpressions` within a callback to find any that match the
 * expected convention.
 *
 * This is useful to assert that a callback is performing the expected work, and
 * it's name matches the targeted convention.
 *
 * If that's not the case, it could be renamed to better reflect the work it's
 * performing.
 *
 * @param {Array<import('ts-morph').CallExpression>} callExpressions array of call expressions inside the callback's AST node
 * @param {Convention} prefix the convention targeted by this callback
 */
function findCallExpressions(callExpressions, prefix) {
  /** @type {Array<import('ts-morph').CallExpression>} */
  const calls = []

  for (const expression of callExpressions) {
    const propertyAccessExpression = expression.getFirstChildByKind(ts.SyntaxKind.PropertyAccessExpression)
    if (propertyAccessExpression) {
      const name = propertyAccessExpression.getName()
      /** @type {Convention | null} */
      const conventionPrefix = extractHookPrefixConvention(name)
      if (conventionPrefix === prefix) {
        calls.push(expression)
        continue
      }
    }

    const identifier = expression.getFirstChildByKind(ts.SyntaxKind.Identifier)
    if (identifier) {
      const name = identifier.getText()
      /** @type {Convention | null} */
      const conventionPrefix = extractHookPrefixConvention(name)
      if (conventionPrefix === prefix) {
        calls.push(expression)
        continue
      }
    }
  }

  return calls
}

/**
 * Validate the call expressions within a callback body to assert that the
 * functions being invoked are within the specified conventions.
 *
 * @param {Array<import('ts-morph').CallExpression>} callExpressions
 * @param {Set<Convention>} conventions
 */
function validateCallExpressions(callExpressions, conventions) {
  /** @type {Array<string>} */
  const validationWarnings = []

  for (const callExpression of callExpressions) {
    const identifier = callExpression.getExpressionIfKind(ts.SyntaxKind.Identifier)
    if (identifier) {
      //
      // This code path will assert on plain functions, e.g. `setColumnValue(model, columnValue)`
      //
      const name = identifier.getText()
      /** @type {Convention | null} */
      const conventionPrefix = extractHookPrefixConvention(name)
      const result = validateName(conventionPrefix, conventions, name)
      if (result) {
        const message = convertResultToMessage(result, name)
        if (message) {
          validationWarnings.push(message)
        }
      }

      continue
    }

    const propertyAccessExpression = callExpression.getFirstChildByKind(ts.SyntaxKind.PropertyAccessExpression)
    if (propertyAccessExpression) {
      //
      // This code path will assert on function calls where a property on an
      // object is invoked, e.g `cancelGetAllMemexData()`
      //
      const name = propertyAccessExpression.getName()
      const nodeText = propertyAccessExpression.getText()

      /** @type {Convention | null} */
      const conventionPrefix = extractHookPrefixConvention(name)

      const result = validateName(conventionPrefix, conventions, nodeText)
      if (result) {
        const message = convertResultToMessage(result, name)
        if (message) {
          validationWarnings.push(message)
        }
      }

      continue
    }

    const relativePath = getPathWithLineNumberAndColumn(callExpression)
    const nodeText = callExpression.getText()

    console.warn(`TODO: Found call expression in file which is not checked: ${relativePath} - node text: '${nodeText}'`)
  }

  return validationWarnings
}

/**
 * Assert that an `update[Something]` callback does not perform work that
 * exceeds it's responsibilities.
 *
 * @param {Array<import('ts-morph').CallExpression>} callExpressionsWithin all CallExpressions within the callback
 */
function validateUpdateCallback(callExpressionsWithin) {
  const warnings = validateCallExpressions(callExpressionsWithin, updateConventions)

  const updateCalls = findCallExpressions(callExpressionsWithin, 'update')
  if (updateCalls.length === 0) {
    warnings.push(
      " - 💡 Expected `update` calls but none found\n    - Could this callback be prefixed with `set` instead of `update` to indicate it doesn't need the backend?",
    )
  }

  return warnings
}

/**
 * Assert that an `remove[Something]` callback does not perform work that
 * exceeds it's responsibilities.
 *
 * @param {Array<import('ts-morph').CallExpression>} callExpressionsWithin all CallExpressions within the callback
 */
function validateRemoveCallback(callExpressionsWithin) {
  const warnings = validateCallExpressions(callExpressionsWithin, removeConventions)

  const removeCalls = findCallExpressions(callExpressionsWithin, 'remove')
  if (removeCalls.length === 0) {
    warnings.push(' - 💡 Expected `remove` calls but none found\n    - Is this callback named correctly?')
  }

  return warnings
}

/**
 * Assert that an `delete[Something]` callback does not perform work that
 * exceeds it's responsibilities.
 *
 * @param {Array<import('ts-morph').CallExpression>} callExpressionsWithin all CallExpressions within the callback
 */
function validateDeleteCallback(callExpressionsWithin) {
  const warnings = validateCallExpressions(callExpressionsWithin, deleteConventions)

  const removeCalls = findCallExpressions(callExpressionsWithin, 'delete')
  if (removeCalls.length === 0) {
    warnings.push(
      " - 💡 Expected `delete` calls but none found\n    - Could this callback be prefixed with `remove` instead of `delete` to indicate it doesn't need the backend?",
    )
  }

  return warnings
}

/**
 * Validate that a callback matches the desired conventions based on it's name
 *
 * @param {Convention} prefix prefix derived from variable name
 * @param {import('ts-morph').VariableDeclaration} variableDeclaration AST node for variable assigned to `useCallback` inside hook
 * @param {import("ts-morph").CallExpression} callExpression body of `useCallback`
 *
 * @returns {OutputMessage}
 */
function validateConventions(prefix, variableDeclaration, callExpression) {
  const callExpressionsWithin = callExpression.getDescendantsOfKind(ts.SyntaxKind.CallExpression)
  const name = variableDeclaration.getName()
  const path = getPathWithLineNumberAndColumn(variableDeclaration)

  switch (prefix) {
    case 'find': {
      const messages = validateCallExpressions(callExpressionsWithin, findConventions)
      return {
        kind: 'callback',
        path,
        name,
        messages,
      }
    }
    case 'get': {
      const messages = validateCallExpressions(callExpressionsWithin, getConventions)
      return {
        kind: 'callback',
        path,
        name,
        messages,
      }
    }
    case 'set': {
      const messages = validateCallExpressions(callExpressionsWithin, setConventions)
      return {
        kind: 'callback',
        path,
        name,
        messages,
      }
    }
    case 'update': {
      const messages = validateUpdateCallback(callExpressionsWithin)
      return {
        kind: 'callback',
        path,
        name,
        messages,
      }
    }
    case 'remove': {
      const messages = validateRemoveCallback(callExpressionsWithin)
      return {
        kind: 'callback',
        path,
        name,
        messages,
      }
    }
    case 'delete': {
      const messages = validateDeleteCallback(callExpressionsWithin)
      return {
        kind: 'callback',
        path,
        name,
        messages,
      }
    }
    default:
      throw new Error(
        `Convention ${prefix} received but not currently supported - please add this as a code path if it's a supported convention`,
      )
  }
}

/** @typedef {{identifier:string, accessor?: string, variableNode: import('ts-morph').VariableDeclaration}} VariableNode */

/**
 * Locate and extract the VariableDeclaration nodes, along with related names,
 * from inside a hook variable for further analysis.
 *
 * @param {import('ts-morph').VariableDeclaration} hookVariable the lambda representing the hook
 *
 * @returns {Array<VariableNode> | null}
 */
function resolveVariablesWithinHook(hookVariable) {
  /** @type Array<VariableNode> */
  const callbacks = []

  const block = hookVariable.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Block)
  const returnStatement = block.getFirstChildByKindOrThrow(ts.SyntaxKind.ReturnStatement)

  const objectLiteralReturnValue = returnStatement.getExpressionIfKind(ts.SyntaxKind.ObjectLiteralExpression)
  if (!objectLiteralReturnValue) {
    return null
  }

  const properties = objectLiteralReturnValue.getProperties()
  for (const property of properties) {
    const propertyIdentifier = property.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier)

    // The property identifier represents the left-hand side of the property
    // assigned to this object literal
    // e.g.
    // return {setColumns, setColumnEntry}
    //
    const identifier = propertyIdentifier.getText()

    //
    // A property accessor may be defined if the value assigned is different to
    // the property on the object literal
    // e.g.
    // return { items: context.items }
    //
    const propertyAccess = property.getFirstChildByKind(ts.SyntaxKind.PropertyAccessExpression)

    const variableDeclaration = findVariableDeclaration(block, identifier)
    if (variableDeclaration) {
      callbacks.push({
        identifier,
        accessor: propertyAccess ? propertyAccess.getText() : undefined,
        variableNode: variableDeclaration,
      })
    }
  }

  return callbacks
}

/**
 * Inspect the variable declaration to see if is the return value from useCallback
 *
 * For example:
 *
 * const updateContent = useCallback(
 *   async (itemId: number, body: string) => {
 *     const {memexProjectItemContent} = await memexClient.updateContent({memexProjectItemId: itemId, body})
 *     setItemContent(itemId, memexProjectItemContent)
 *   },
 *   [memexClient, setItemContent]
 * )
 *
 * @param {import("ts-morph").VariableDeclaration} variable
 *
 * @returns the `useCallback` AST node to enable inspecting of the contents, or
 *          `null` if the variable is something else
 */
function resolveCallbackCallExpression(variable) {
  const callExpression = variable.getFirstChildByKind(ts.SyntaxKind.CallExpression)
  if (!callExpression) {
    return null
  }

  const callIdentifier = callExpression.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)
  const callIdentifierText = callIdentifier.getText()
  if (callIdentifierText === 'useCallback') {
    return callExpression
  }

  return null
}

/**
 * Navigate the returned object from a hook to locate the associated callbacks
 * and assert their behavior matches the expected conventions.
 *
 * @param {import('ts-morph').VariableDeclaration} hookVariable the lambda representing the hook
 *
 * @returns {Array<OutputMessage> | null}
 */
function validateObjectLiteral(hookVariable) {
  const variables = resolveVariablesWithinHook(hookVariable)
  if (variables === null) {
    return null
  }

  /** @type {Array<OutputMessage>} */
  const outputMessages = []

  for (const variable of variables) {
    const {identifier, variableNode} = variable

    const callback = resolveCallbackCallExpression(variableNode)
    if (!callback) {
      continue
    }

    /** @type {Convention | null} */
    const prefix = extractHookPrefixConvention(identifier)
    if (prefix) {
      const outputMessage = validateConventions(prefix, variableNode, callback)
      outputMessages.push(outputMessage)
    }
  }

  return outputMessages
}

/**
 * Validate the name of each callbacks within the hook match the functionality
 * implemented within each callback body.
 *
 * If these are incorrectly named, or invoking functionality that doesn't match
 * the permitted conventions, a message will be reported to the user.
 *
 * @param {import('ts-morph').VariableDeclaration} hookVariable the lambda representing the hook
 */
function validateCallbacksWithinHook(hookVariable) {
  const messages = validateObjectLiteral(hookVariable)
  if (messages) {
    for (const m of messages) {
      output(m)
    }
    return
  }

  const block = hookVariable.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Block)
  const returnStatement = block.getFirstChildByKindOrThrow(ts.SyntaxKind.ReturnStatement)

  const identifierReturnType = returnStatement.getExpressionIfKind(ts.SyntaxKind.Identifier)
  if (identifierReturnType) {
    const identiferText = identifierReturnType.getText()
    if (identiferText === 'context' || identiferText === 'contextValue') {
      return
    }
  }

  const callExpressionReturnType = returnStatement.getExpressionIfKind(ts.SyntaxKind.CallExpression)
  if (callExpressionReturnType) {
    const callExpressionIdentifier = callExpressionReturnType.getFirstDescendantByKind(ts.SyntaxKind.Identifier)
    if (callExpressionIdentifier) {
      const callIdentifierText = callExpressionIdentifier.getText()
      if (callIdentifierText === 'useColumnsContext') {
        return
      }
    }
  }

  const expression = returnStatement.getExpression()

  const relativePath = expression && getPathWithLineNumberAndColumn(expression)
  const nodeText = expression?.getText()
  const kindName = expression?.getKindName()

  console.warn(
    `TODO: Found return statement expression of type ${kindName} in file which is not checked: ${relativePath} - node text: '${nodeText}'`,
  )
}

/**
 * Generate an error message about the conventions for this hook method not
 * being satisfied
 *
 * @param {string} variableName the callback that does not match with it's expected internals
 * @param {Set<Convention>} conventions the designated conventions that it should be following
 */
function variableNameDoesNotMatchConventions(variableName, conventions) {
  return ` - ❌ found variable name '${variableName}' which does not match allowed conventions\n    - expected prefix to be one of: ${[
    ...conventions.values(),
  ]
    .map(p => `'${p}'`)
    .join(', ')}`
}

/**
 * Validate the prefix of the hook variable name aligns with the convention
 * by interrogating the callbacks returned by the hook.
 *
 * @param {import('ts-morph').VariableDeclaration} hookVariable
 *
 * @returns {OutputMessage | null | undefined}
 */
function validateHookName(hookVariable) {
  const identifier = hookVariable.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier)
  const name = identifier.getText()

  const hookNameWithoutUsePrefix = name.substring(3)
  const firstHookNameWithoutUserPrefix = hookNameWithoutUsePrefix[0]
  if (!firstHookNameWithoutUserPrefix) return null
  const formatHookNameWithoutUsePrefix =
    firstHookNameWithoutUserPrefix.toLocaleLowerCase() + hookNameWithoutUsePrefix.substring(1)

  const pathWithLineNumberAndColumn = getPathWithLineNumberAndColumn(identifier)

  /** @type {Convention | null} */
  const hookNamePrefix = extractHookPrefixConvention(formatHookNameWithoutUsePrefix)
  const upperCaseLettersinHookName = formatHookNameWithoutUsePrefix.match(/[A-Z]/g)

  const hasAdditionalVerbs = upperCaseLettersinHookName && upperCaseLettersinHookName.length > 0

  if (hookNamePrefix && hasAdditionalVerbs) {
    const variables = resolveVariablesWithinHook(hookVariable)
    if (variables === null) {
      return null
    }

    /** @type {Array<string>} */
    const messages = []

    const conventions = getConventionsForPrefix(hookNamePrefix)

    for (const variable of variables) {
      const {identifier: variableIdentifier, variableNode} = variable

      const callback = resolveCallbackCallExpression(variableNode)
      if (!callback) {
        continue
      }

      /** @type {Convention | null} */
      const prefix = extractHookPrefixConvention(variableIdentifier)
      if (prefix && !conventions.has(prefix)) {
        messages.push(variableNameDoesNotMatchConventions(variableIdentifier, conventions))
      }
    }

    return {
      kind: 'hook',
      name,
      path: pathWithLineNumberAndColumn,
      messages,
    }
  }
}

/**
 * Process a state provider hook file and audit the components to ensure the
 * conventions are being followed.
 *
 * @param {import('ts-morph').SourceFile} sourceFile
 */
function processHookFile(sourceFile) {
  const exports = sourceFile.getDescendantsOfKind(ts.SyntaxKind.ExportKeyword)
  if (exports.length === 0) {
    return
  }

  for (const e of exports) {
    const parent = e.getParentOrThrow()
    const variableDeclarations = parent.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration)
    for (const variable of variableDeclarations) {
      const identifier = variable.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier)
      const name = identifier.getText()

      if (name.startsWith('use')) {
        const result = validateHookName(variable)
        if (result) {
          output(result)
        }

        validateCallbacksWithinHook(variable)
      }
    }
  }
}

/**
 * Helper function for outputting details to the user
 *
 * @param {OutputMessage} outputMessage message shape associated with validator
 */
function output(outputMessage) {
  if (outputMessage.messages.length === 0) {
    return
  }

  const {name, kind} = outputMessage

  console.warn(`Validating ${kind} '${name}' in file ${outputMessage.path} -`)
  for (const r of outputMessage.messages) {
    console.warn(r)
  }

  console.log()
}

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
})

const stateProviderFiles = findStateProviderFiles(project)

for (const f of stateProviderFiles) {
  const filePath = f.getFilePath()
  const fileName = basename(filePath)

  if (fileName.startsWith('use-')) {
    processHookFile(f)
  }
}
