const {basename, dirname} = require('path')

/**
 * This lint rule ensures that all dependencies in package.json files are either:
 * 1. Internal dependencies that use "*" as the version number (eg "@github-ui/react-core": "*")
 * 2. External dependencies that use a specific version number (eg "glob": "7.1.6")
 * 3. External dependencies that are managed by another package and use "*" as the version number (eg "react": "*")
 *
 * The list of managed dependencies is defined below. We generally want to keep this list small,
 * and only add dependencies which are intentionally controlled by a single team. We should
 * tend toward each package declaring specific version numbers so that package owners are
 * pinged as a codeowner when a dependency is updated.
 */

const managedDependencies = {
  '@github/browser-support': '@npm-workspaces/core',
  '@github/catalyst': '@npm-workspaces/primer',
  '@github/combobox-nav': '@npm-workspaces/core',
  '@github/jtml': '@npm-workspaces/core',
  '@github/selector-observer': '@npm-workspaces/core',
  '@github/turbo': '@github-ui/turbo',
  '@primer/behaviors': '@npm-workspaces/primer',
  '@primer/css-legacy': '@npm-workspaces/primer',
  '@primer/css': '@npm-workspaces/primer',
  '@primer/live-region-element': '@npm-workspaces/primer',
  '@primer/octicons-react': '@npm-workspaces/primer',
  '@primer/primitives': '@npm-workspaces/primer',
  '@primer/react': '@npm-workspaces/primer',
  '@primer/view-components': '@npm-workspaces/primer',
  '@storybook/jest': '@github-ui/storybook',
  '@storybook/addon-actions': '@github-ui/storybook',
  '@storybook/addon-essentials': '@github-ui/storybook',
  '@storybook/preview-api': '@github-ui/storybook',
  '@storybook/react': '@github-ui/storybook',
  '@storybook/test': '@github-ui/storybook',
  '@testing-library/jest-dom': '@github-ui/jest',
  '@testing-library/react': '@github-ui/react-core',
  'user-event-13': '@github-ui/react-core',
  'user-event-14': '@github-ui/react-core',
  '@types/react-dom': '@npm-workspaces/react-core',
  '@types/react': '@npm-workspaces/react-core',
  'fzy.js': '@npm-workspaces/core',
  'react-dom': '@github-ui/react-core',
  'react-relay': '@npm-workspaces/relay',
  'react-router-dom': '@github-ui/react-core',
  'relay-runtime': '@github-ui/relay-environment',
  'relay-test-utils': '@npm-workspaces/relay',
  'styled-components': '@github-ui/react-core',
  typescript: '@npm-workspaces/core',
  clsx: '@npm-workspaces/react-core',
  history: '@github-ui/react-core',
  react: '@github-ui/react-core',
  webpack: '@github-ui/webpack',
}

// This list should only be added to if we are _intentionally_ using a different version of a dependency
const exemptDependencies = {
  '@github-ui/react-next': ['react', 'react-dom'],
}

function isManagedDependency(dependencyName, currentPackageName) {
  const owningPackage = managedDependencies[dependencyName]
  return owningPackage && owningPackage !== currentPackageName
}

function isExemptDependency(dependencyName, currentPackageName) {
  const exemptPackages = exemptDependencies[currentPackageName]
  return exemptPackages && exemptPackages.includes(dependencyName)
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensure external dependencies have a specific version number, and internal dependencies use "*"`,
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    const fileName = context.getFilename()
    const currentPackageName = `@github-ui/${basename(dirname(fileName))}`

    return {
      Property(node) {
        const {key, value} = node

        if ((key.value !== 'dependencies' && key.value !== 'devDependencies') || value.type !== 'ObjectExpression') {
          return
        }

        for (const prop of value.properties) {
          const dependencyName = prop.key.value

          if (isExemptDependency(dependencyName, currentPackageName) || prop.value.type !== 'Literal') {
            continue
          }

          // Internal/managed dependencies should always use "*"
          if (dependencyName.startsWith('@github-ui/') || isManagedDependency(dependencyName, currentPackageName)) {
            if (prop.value.value !== '*') {
              context.report({
                node: prop.value,
                message: `Dependency "${dependencyName}" in "${key.value}" should have version "*"`,
                fix: fixer => fixer.replaceText(prop.value, '"*"'),
              })
            }
          } else if (prop.value.value === '*') {
            // Any other dependency should use a specific version number
            context.report({
              node: prop.value,
              message: `Dependency "${dependencyName}" in "${key.value}" is an external dependency and needs a specific version number`,
            })
          }
        }
      },
    }
  },
}
