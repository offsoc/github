const orderHash = require('../helpers/order-hash')
const REQUIRED_SCRIPTS = ['tsc', 'lint', 'test']
const SCRIPTS = {
  tsc: 'tsc',
  lint: 'eslint --cache --max-warnings=0 . --ext .js,.ts,.tsx,.json',
  test: 'jest',
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Monorepo packages require (${REQUIRED_SCRIPTS.join(',')}) scripts in package.json`,
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      'Program:exit': node => {
        const {text} = context.getSourceCode()

        const packageJson = JSON.parse(text)
        for (const script of REQUIRED_SCRIPTS) {
          if (!packageJson.scripts || !packageJson.scripts[script]) {
            context.report({
              node,
              message: `Missing required script "${script}" in package.json`,
              fix: fixer => {
                if (!packageJson.scripts) packageJson.scripts = {}

                packageJson.scripts[script] = SCRIPTS[script]
                packageJson.scripts = orderHash(packageJson.scripts)

                return fixer.replaceText(node, JSON.stringify(packageJson, null, 2))
              },
            })
          }
        }
      },
    }
  },
}
