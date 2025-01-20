const orderHash = require('../helpers/order-hash')
const REQUIRED_DEV_DEPENDENCIES = ['@github-ui/eslintrc', '@github-ui/jest']

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Monorepo packages require (${REQUIRED_DEV_DEPENDENCIES.join(',')}) as dev dependencies`,
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      'Program:exit': node => {
        const {text} = context.getSourceCode()

        const packageJson = JSON.parse(text)
        for (const devDependency of REQUIRED_DEV_DEPENDENCIES) {
          if (!packageJson.devDependencies || !packageJson.devDependencies[devDependency]) {
            context.report({
              node,
              message: `Missing required devDependency "${devDependency}" in package.json`,
              fix: fixer => {
                if (!packageJson.devDependencies) packageJson.devDependencies = {}

                packageJson.devDependencies[devDependency] = '*'
                packageJson.devDependencies = orderHash(packageJson.devDependencies)

                return fixer.replaceText(node, JSON.stringify(packageJson, null, 2))
              },
            })
          }
        }
      },
    }
  },
}
