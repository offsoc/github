const {resolve} = require('node:path')
const {readFileSync} = require('node:fs')
const {env} = require('node:process')

const isRunningAsExtension = env['VSCODE_AMD_ENTRYPOINT']?.includes('extensionHostProcess')

const MAX_NAMES_AGE_MS = 10_000

/** @type {undefined | {value: Set<string>, updated: number}} */
let commandNamesCache

function getCompiledCommandNames() {
  const now = new Date().getTime()

  if (
    commandNamesCache &&
    // When not running as extension, we can keep reusing the data for the life of the short-lived process.
    // When running as an extension, the process lives as long as the editor instance. In this case we need to update
    // the data if it's sufficiently old; otherwise the user will need to restart the ESLint server
    // every time they run `npm run ui-commands:compile`. We probably could run on every relint but that can happen
    // on every keypress which is a bit excessive even for this fast IO operation, so we throttle to max 10s or so.
    (!isRunningAsExtension || now - commandNamesCache.updated < MAX_NAMES_AGE_MS)
  )
    return commandNamesCache.value

  console.log('UPDATE')

  const metadataJson = readFileSync(resolve(__dirname, '../../ui-commands/__generated__/ui-commands.json'), {
    encoding: 'utf-8',
  })
  const names = new Set(Object.keys(JSON.parse(metadataJson).commands))
  commandNamesCache = {value: names, updated: now}
  return new Set(Object.keys(JSON.parse(metadataJson).commands))
}

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'warning',
    docs: {
      description: 'Run `npm run ui-commands:compile` after updating command metadata.',
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      /** @param node {import("@typescript-eslint/types/dist/ts-estree").TSESTree.JSXOpeningElement} */
      JSXOpeningElement(node) {
        const nameExpression = node.name
        const tagName = nameExpression.type === 'JSXIdentifier' ? nameExpression.name : null
        if (tagName !== 'ScopedCommands' && tagName !== 'GlobalCommands') return

        for (const attribute of node.attributes)
          if (
            attribute.type === 'JSXAttribute' &&
            attribute.name.type === 'JSXIdentifier' &&
            attribute.name.name === 'commands' &&
            attribute.value?.type === 'JSXExpressionContainer' &&
            attribute.value.expression.type === 'ObjectExpression'
          )
            for (const property of attribute.value.expression.properties)
              if (
                'key' in property &&
                property.key.type === 'Literal' &&
                typeof property.key.value === 'string' &&
                !getCompiledCommandNames().has(property.key.value)
              ) {
                context.report({
                  // @ts-expect-error expecting wrong parser node type
                  node: property,
                  message: 'Unrecognized command ID. Try running `npm run ui-commands:compile` to update types.',
                })
              }
      },
    }
  },
}
