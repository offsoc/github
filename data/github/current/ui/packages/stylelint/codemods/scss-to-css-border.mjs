import stylelint from 'stylelint'
import declarationValueIndex from 'stylelint/lib/utils/declarationValueIndex.cjs'
import valueParser from 'postcss-value-parser'

const {utils} = stylelint

const ruleName = 'codemod/scss-to-css-border'

const meta = {
  fixable: true,
}

const messages = utils.ruleMessages(ruleName, {
  rejected: (unfixed, fixed) => `Expected "${unfixed}" to be "${fixed}"`,
})

const walkGroups = (root, validate) => {
  for (const node of root.nodes) {
    if (node.type === 'function') {
      walkGroups(node, validate)
    } else {
      validate(node)
    }
  }
  return root
}

const replacements = {
  $border: 'solid var(--borderWidth-thin) var(--borderColor-default)',
  '$border-width': 'var(--borderWidth-thin)',
  '$border-style': 'solid',
  '$border-rem': 'solid var(--borderWidth-thin) var(--borderColor-default)',
  '$border-radius': 'var(--borderRadius-medium)',
  '$border-radius-1': 'var(--borderRadius-small)',
  '$border-radius-2': 'var(--borderRadius-medium)',
  '$border-radius-3': 'var(--borderRadius-medium)',
}

const escape = input => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ruleFunction = (primaryOption, secondaryOptions, context) => (root, result) => {
  root.walkDecls(declaration => {
    const value = declaration.value

    // Math operators are skipped
    const math = ['-$', '+', '*', '/'].some(
      operator => value.match(new RegExp(`(\\b|\\s)${escape(operator)}(\\b|\\s)`, 'g')) !== null,
    )

    const parsedValue = valueParser(value).walk(node => {
      if (node.type !== 'word') {
        return
      }
      const declValue = node.value

      for (const [key, replacement] of Object.entries(replacements)) {
        const regex = new RegExp(`${escape(key)}([\\*\\+].*)?$`, 'g')

        if (declValue.match(regex)) {
          let suggestedValue = ''
          let fixable = false

          suggestedValue = declValue.replace(regex, replacement)

          if (suggestedValue !== node.value && !math) {
            fixable = true
          }

          if (context.fix && fixable) {
            node.value = suggestedValue
          }

          const index = declarationValueIndex(declaration) + node.sourceIndex

          utils.report({
            index,
            endIndex: index + declValue.length,
            ruleName,
            result,
            node: declaration,
            message: messages.rejected(declValue, fixable ? suggestedValue : undefined),
          })
        }
      }
      return
    })

    if (context.fix) {
      declaration.value = parsedValue.toString()
    }
  })
}

ruleFunction.ruleName = ruleName
ruleFunction.messages = messages
ruleFunction.meta = meta

const pluginObject = stylelint.createPlugin(ruleName, ruleFunction)

export default pluginObject
export {ruleName, messages, pluginObject as plugin, ruleFunction as rule}
