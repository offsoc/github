const {existsSync, writeFileSync, readFileSync} = require('fs')
const {join, dirname} = require('path')
const REQUIRED_FILES = ['tsconfig.json', 'jest.config.js']

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Monorepo packages require (${REQUIRED_FILES.join(',')}) files in the root`,
    },
    schema: [],
  },

  create(context) {
    return {
      'Program:exit': node => {
        const path = dirname(context.getPhysicalFilename())

        for (const file of REQUIRED_FILES) {
          if (!existsSync(join(path, file))) {
            context.report({
              node,
              message: `Missing required file "${file}" in the package root`,
              fix: () => {
                const content = readFileSync(
                  join(__dirname, '../../ui-packages-tooling/templates', `${file}.hbs`),
                  'utf8',
                )
                writeFileSync(join(path, file), content)
              },
            })
          }
        }
      },
    }
  },
}
