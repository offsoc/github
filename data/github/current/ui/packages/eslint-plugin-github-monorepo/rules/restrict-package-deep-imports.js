const {readFileSync} = require('fs')
const {join, extname} = require('path')
const glob = require('glob')

const findPackageExports = packageName => {
  const packagePath = join(__dirname, '../../', packageName)
  const packageJsonPath = join(packagePath, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath))

  const packageExports = new Set()

  if (packageJson.name) packageExports.add(packageJson.name)

  for (const namedExport of Object.keys(packageJson.exports || {})) {
    if (namedExport.includes('*')) {
      const paths = glob.sync(join(packagePath, namedExport))

      for (const path of paths) {
        const internalPath = path.replace(packagePath, '').replace(extname(path), '')
        packageExports.add(join(packageJson.name, internalPath))
      }
    } else {
      packageExports.add(join(packageJson.name, namedExport))
    }
  }

  return packageExports
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Only import the top-level package entrypoint or its named exports.',
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importedValue = node.source.value

        if (!importedValue.startsWith('@github-ui')) return

        const packageName = importedValue.split('/')[1]

        if (importedValue.split('/').length === 2) return

        const packageAllowedImports = findPackageExports(packageName)

        if (!packageAllowedImports || packageAllowedImports.length === 0) {
          return context.report({
            node: node.source,
            message: 'Import path invalid, this package does not export any named exports',
          })
        }

        if (packageAllowedImports.has(importedValue)) return

        context.report({
          node: node.source,
          message: `Import path invalid, @github-ui/${packageName} only allows importing from ${[
            ...packageAllowedImports,
          ].join(', ')}`,
        })
      },
    }
  },
}
