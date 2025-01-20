const {basename, dirname} = require('path')

const REQUIRED_FIELDS = {
  name: {
    validate: (val, path) => val === `@github-ui/${basename(path)}`,
    fix: (fixer, packageJson, node, path) => {
      packageJson.name = `@github-ui/${basename(path)}`

      return fixer.replaceText(node, JSON.stringify(packageJson, null, 2))
    },
    message: path => `Expected the package to be named @github-ui/${basename(path)}`,
  },
  description: {
    validate: val => Boolean(val),
    message: () => 'Packages must have a description',
  },
  private: {
    validate: val => val === true,
    fix: (fixer, packageJson, node) => {
      packageJson.private = true

      return fixer.replaceText(node, JSON.stringify(packageJson, null, 2))
    },
    message: () => 'Expected the private field to be true',
  },
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Monorepo packages require (${Object.keys(REQUIRED_FIELDS).join(',')}) in package.json`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          skip: {
            type: 'array',
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },

  create(context) {
    return {
      'Program:exit': node => {
        const {text} = context.getSourceCode()
        const path = dirname(context.getPhysicalFilename())
        const skip = context.options?.[0]?.skip ?? []

        const packageJson = JSON.parse(text)
        for (const [field, options] of Object.entries(REQUIRED_FIELDS)) {
          if (skip.includes(field)) continue

          if (!options.validate(packageJson[field], path)) {
            context.report({
              node,
              message: options.message(path),
              fix: fixer => options.fix && options.fix(fixer, packageJson, node, path),
            })
          }
        }
      },
    }
  },
}
