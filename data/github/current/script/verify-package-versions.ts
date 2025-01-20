import glob from 'glob'
import {readFileSync} from 'fs'

interface DependencyTree {
  [key: string]: {
    [key: string]: string[]
  }
}

interface PackageJSON {
  name: string
  dependencies?: {[key: string]: string}
  devDependencies?: {[key: string]: string}
  workspaces?: string[]
}

const IGNORED_PACKAGES = [
  '@github/snek',
  '@github-ui/react-next',
  '@github-ui/memex',
]

function findMismatchedVersions(dependencyMap: DependencyTree) {
  const errors: string[] = []

  for (const [name, versions] of Object.entries(dependencyMap)) {
    if (Object.keys(versions).length > 1) {
      const msg: string[] = [`Found mismatched versions for ${name}:`]

      for (const [version, packages] of Object.entries(versions)) {
        msg.push(`  - Version ${version} is defined in ${packages.join(', ')}`)
      }

      errors.push(msg.join('\n'))
    }
  }

  return errors
}

function extractDependencies(dependencyTree: DependencyTree, packageName: string, dependencies?: {[key: string]: string}) {
  if (!dependencies) return

  for (const [dependency, version] of Object.entries(dependencies)) {
    if (version === "*" || IGNORED_PACKAGES.includes(packageName)) continue

    dependencyTree[dependency] ||= {}
    dependencyTree[dependency][version] ||= []
    dependencyTree[dependency][version].push(packageName)
  }
}

function readPackageJson(path: string) {
  return JSON.parse(readFileSync(path, {encoding: 'utf-8'})) as PackageJSON
}

function findDependencies() {
  const {workspaces} = readPackageJson('package.json')
  const paths = glob.sync(`{${workspaces?.join(',')}}/package.json`, {ignore: ['**/node_modules/**'], absolute: true})
  const dependencyTree: DependencyTree = {}

  if (paths.length < 100) {
    throw new Error('package.json blob did not discover a sufficient number of packages')
  }

  for (const path of paths) {
    const pkg = readPackageJson(path)

    extractDependencies(dependencyTree, pkg.name, pkg.dependencies)
    extractDependencies(dependencyTree, pkg.name, pkg.devDependencies)
  }

  return dependencyTree
}

function main() {
  try {
    const dependencyTree = findDependencies()
    const errors = findMismatchedVersions(dependencyTree)

    if (errors.length > 0) {
      console.log(errors.join('\n'))

      return 1
    }
  } catch {
    return 1
  }

  return 0
}

process.exit(main())
