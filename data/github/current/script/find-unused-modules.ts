import {Project, Node} from 'ts-morph'
import {createHmac} from 'crypto'
import path from 'path'

interface Violation {
  path: string
  linenumber: number
  functionName: string
}

interface JankyResultOutput {
  suite: string
  name: string
  message: string
  fingerprint: string
  areas_of_responsibility?: string
  areas_of_responsibility_error?: string
  location?: string
  duration?: string
  hostname?: string
  backtrace?: string
  exception_class?: string
}

const basePath = path.resolve(__dirname, '../')
const ignoredExports = new Set(
  [
    'app/assets/modules/alloy/index.ts#handleRequest',
    // We don't detect usages from 'app/assets/workers' so we need to ignore these
    'app/assets/modules/react-code-view/components/file-tree/FileResultsList.tsx#FindFileRequest',
    'app/assets/modules/react-code-view/components/file-tree/FileResultsList.tsx#FindFileResponse',
    // Memex-specific exports that are not used as part of the production bundle currently
    'ui/packages/memex/src/client/router/index.tsx#Navigate',
    'ui/packages/memex/src/client/platform/session-storage.ts#clearSessionDataForKey',
    'ui/packages/memex/src/client/helpers/route-helper.ts#requireWriteRoute',
    'ui/packages/memex/src/client/components/react_table/performance-measurements.ts#recordMeasurement',
  ].map(x => `${basePath}/${x}`),
)

// see https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/ssr/ssr-tools/#use-resolvealias-to-shim-out-ssr-unfriendly-node-modules
const serverFileRegex = /\.server\.(js|ts|tsx)$/

/*
  This is a special flag to differentiate between linting the root tsconfig.json and the new
  ui/packages/memex/tsconfig.json so that we can explore better parallelizing the linting of our
  TS files.
*/
const isMemex = process.argv.indexOf('--memex') > -1

function checkNode(node: Node) {
  if (!Node.isReferenceFindable(node)) return

  const file = node.getSourceFile()
  const hasExternalReferences = node.findReferencesAsNodes().some(n => n.getSourceFile() !== file)

  if (!hasExternalReferences) {
    const path = file.getFilePath()
    if (path.includes('__generated__')) return
    if (serverFileRegex.test(path)) return

    const functionName = Node.hasName(node) ? node.getName() : node.getText()
    if (functionName.includes('{')) return // this script doesn't handle destructured assignment like `export const {foo, bar} = something()` properly.
    if (ignoredExports.has(`${path}#${functionName}`)) return // explicitly ignored exports

    const linenumber = node.getStartLineNumber()
    return {path, linenumber, functionName}
  }
}

function isExported(node: Node) {
  return Node.isExportable(node) && node.isExported()
}

function findViolations(project: Project) {
  const violations: Violation[] = []

  for (const file of resolveFiles(project)) {
    const path = file.getFilePath()

    // Memex currently has some custom typings defined within the project.
    // Ignoring these for now, will clean up once they can be better located.
    if (path.endsWith('.d.ts')) continue

    file.forEachChild(child => {
      if (Node.isVariableStatement(child)) {
        if (isExported(child)) {
          for (const node of child.getDeclarations()) {
            const violation = checkNode(node)
            if (violation) {
              violations.push(violation)
            }
          }
        }
      } else if (isExported(child)) {
        const violation = checkNode(child)
        if (violation) {
          violations.push(violation)
        }
      }
    })
  }
  return violations
}

function getViolations(project: Project) {
  const violations = findViolations(project)

  const results: JankyResultOutput[] = []
  const rootDir = `${process.cwd()}/`

  for (const {path, linenumber, functionName} of violations) {
    const location = `${path.replace(rootDir, '')}:${linenumber}`
    const message = `${functionName} is exported but not imported anywhere`
    results.push({
      suite: 'Unused TypeScript Modules',
      name: 'Unused TypeScript Modules',
      message,
      fingerprint: createHmac('sha256', 'secret seed').update(message).update(location).digest('hex').slice(32),
      location,
    })
  }
  return results
}

/**
 * Resolve project files to lint based on the context this script is performing in.
 *
 * The root `tsconfig.json` is pulling in files within `ui/packages/memex` currently which we want to lint
 * separately, rather than pulling in all of the github/memex source.
 *
 * So in our default mode, this check will ensure `ts-morph` ignores those files from being linted. These
 * will be handled by `--memex` mode.
 */
function resolveFiles(project: Project) {
  return isMemex
    ? project.getSourceFiles(['ui/packages/memex/**/*.ts', 'ui/packages/memex/**/*.tsx'])
    : project.getSourceFiles(['**/*.ts', '**/*.tsx', '!ui/packages/memex/**/*'])
}

/**
 * Setup the project for ts-morph based on the context this script is performing in.
 *
 * Rather than passing in the entire memex source directory, if the flag is set we will
 * switch over to those set of project configurations for linting.
 *
 * Otherwise we will behave in the original way, before the Memex code was imported.
 */
function configureProject(paths: string[]) {
  if (isMemex) {
    const project = new Project({tsConfigFilePath: 'ui/packages/memex/tsconfig.json'})

    project.addSourceFilesFromTsConfig('ui/packages/memex/src/tests/tsconfig.json')
    project.addSourceFilesFromTsConfig('ui/packages/memex/src/playwright-tests/tsconfig.json')

    return project
  } else {
    const project = new Project({tsConfigFilePath: 'tsconfig.json'})
    project.addSourceFilesFromTsConfig('tsconfig.wtr.json')

    if (paths) {
      project.addSourceFilesAtPaths(paths)
    }

    return project
  }
}

function main(paths: string[]) {
  const project = configureProject(paths)

  let exitCode = 0
  const results = getViolations(project)
  for (const result of results) {
    exitCode = 1
    if (process.env.GITHUB_CI) {
      console.log(`===FAILURE===\n${JSON.stringify(result, null, 4)}\n===END FAILURE===`)
    } else {
      console.log(result.location)
      console.log(`  ${result.message}`)
    }
  }
  return exitCode
}

const paths = process.argv.slice(2)
const exitCode = main(paths)
process.exit(exitCode)
