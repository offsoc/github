/**
 * Check if the file path is a JS(X) or TS(X) file in `app/assets/modules/react-shared` or `ui/packages`.
 * @param {import('eslint').Rule.RuleContext} context
 */
const isReactUi = context =>
  /(app\/assets\/modules\/react-shared\/|ui\/packages\/).*\.[tj]sx?$/.test(context.getFilename())

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prefer using `ui-commands` over manual shortcut logic.',
    },
    schema: [],
  },

  create(context) {
    return {
      MemberExpression(node) {
        const {object, property} = node

        if (
          object.type === 'Identifier' &&
          object.name.startsWith('e') &&
          property.type === 'Identifier' &&
          // TODO: Add check for event.code & event.shiftKey
          /^((meta|ctrl|alt)Key|key)$/.test(property.name)
        ) {
          context.report({
            node,
            // ui-commands is only available for React code for now
            message: `Prefer using ${
              isReactUi(context) ? 'the `@github-ui/ui-commands` platform' : 'data-hotkey'
            } instead of manual shortcut logic`,
          })
        }
      },
    }
  },
}
