import stylelint from 'stylelint'
import declarationValueIndex from 'stylelint/lib/utils/declarationValueIndex.cjs'
import valueParser from 'postcss-value-parser'

const {utils} = stylelint

const ruleName = 'codemod/scss-to-css-spacing'

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
  // $spacer: 'var(--base-size-8)',
  '$spacer-0': '0',
  '$spacer-1': 'var(--base-size-4)',
  '$spacer-2': 'var(--base-size-8)',
  '$spacer-3': 'var(--base-size-16)',
  '$spacer-4': 'var(--base-size-24)',
  '$spacer-5': 'var(--base-size-32)',
  '$spacer-6': 'var(--base-size-40)',
  '$spacer-7': 'var(--base-size-48)',
  '$spacer-8': 'var(--base-size-64)',
  '$spacer-9': 'var(--base-size-80)',
  '$spacer-10': 'var(--base-size-96)',
  '$spacer-11': 'var(--base-size-112)',
  '$spacer-12': 'var(--base-size-128)',
}

const escape = input => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ruleFunction = (primaryOption, secondaryOptions, context) => (root, result) => {
  root.walkDecls(declaration => {
    const value = declaration.value
    // Math operators are skipped
    const math = ['-', '+', '*', '/'].some(
      operator => value.match(new RegExp(`\\s${escape(operator)}\\s`, 'g')) !== null,
    )

    // Sass functions are skipped
    const sassFunction = ['lighten', 'rem'].some(func => value.match(new RegExp(`${escape(func)}\\(`, 'g')) !== null)

    const parsedValue = walkGroups(valueParser(value), node => {
      const declValue = node.value
      for (const [key, replacement] of Object.entries(replacements)) {
        if (declValue.includes(key)) {
          let suggestedValue = ''
          let fixable = false

          if (declValue.startsWith('-$')) {
            const regex = new RegExp(`-${escape(key)}\\b`, 'g')
            suggestedValue = declValue.replaceAll(regex, `calc(${replacement} * -1)`)
          } else {
            const regex = new RegExp(`${escape(key)}\\b`, 'g')
            suggestedValue = declValue.replaceAll(regex, replacement)
          }

          if (suggestedValue !== node.value && !math && !sassFunction) {
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
            message: messages.rejected(declValue, suggestedValue),
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
