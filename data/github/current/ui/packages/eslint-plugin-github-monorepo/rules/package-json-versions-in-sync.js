const {readFileSync} = require('fs')
const {join} = require('path')

const rootPackageDir = join(__dirname, '../../')
const toKeepInSync = [
  {
    dependenciesToEnforce: ['relay-compiler', 'relay-runtime'],
    packageNamesToEnforce: ['relay-build', 'relay-environment'],
  },
]

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Dependency versions in package.json must be in sync with the other package versions`,
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    return {
      Property(node) {
        const {key: currentKey, value: currentValue} = node

        // If value is not literal or using wildcard version, early exit
        if (currentValue.type !== 'Literal' || currentValue.value === '*') return

        const matchedPackage = toKeepInSync.find(({dependenciesToEnforce}) =>
          dependenciesToEnforce.some(dependency => dependency === currentKey.value),
        )
        // If node is not a dependency in the list, early exit
        if (!matchedPackage) return

        const uiPackageJsonPaths = matchedPackage.packageNamesToEnforce.map(packageName =>
          join(rootPackageDir, packageName, '/package.json'),
        )
        for (const packageJsonPath of uiPackageJsonPaths) {
          const matchedJsonContent = readFileSync(packageJsonPath, 'utf8')
          for (const dependencyName of matchedPackage.dependenciesToEnforce) {
            // Checks for any dependencies not using "*"
            // successful match result: ['"relay-runtime": "~1"', '~1']
            const versionMatcher = new RegExp(`"${dependencyName}": "(.+)"`)
            const versionMatches = versionMatcher.exec(matchedJsonContent)
            // If package.json doesn't have a dependency we care about, check next file
            if (!versionMatches) continue

            const matchedVersion = versionMatches[1]
            if (currentValue.value !== matchedVersion) {
              const matchedPackageName = JSON.parse(matchedJsonContent).name
              context.report({
                node,
                message: `This package has a dependency on ${currentKey.value}@${currentValue.value}, which differs from the ${dependencyName}@${matchedVersion} version used in the ${matchedPackageName} package. These version numbers must be in sync. `,
              })
            }
          }
        }
      },
    }
  },
}
