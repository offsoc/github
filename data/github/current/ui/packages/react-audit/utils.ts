import {spawnSync} from 'node:child_process'
import {join, resolve, basename, dirname} from 'node:path'
import {Project, type SourceFile} from 'ts-morph'

interface Workspace {
  path: string
}

type Exports = Record<string, string | PlatformExport>

export interface Package {
  name: string
  path: string
  exports: Exports
  components: Component[]
  stories: string[]
}

interface PlatformExport {
  default: string
}

export interface Component {
  path: string
  story: string | undefined
}

const EXCLUDED_COMPONENT_PATHS = [
  'ui/packages/js-resource/JSResource.tsx',
  'ui/packages/react-core/JsonRoute.tsx',
  'ui/packages/react-core/PartialEntry.tsx',
  'ui/packages/react-core/ReactAppElement.tsx',
  'ui/packages/react-core/ReactSSR.tsx',
  'ui/packages/relay-route/RelayRoute.tsx',
]

export function getWorkspaces() {
  const workspaces = spawnSync('npm', ['query', '.workspace']).stdout.toString('utf8')

  return JSON.parse(workspaces)
}

export function mapWorkspaceToPackages(workspace: Workspace, verbose: boolean = true) {
  const {path} = workspace
  const pkgPath = join(path, 'package.json')
  // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
  const pkg = require(pkgPath)
  const {name, exports, componentInfo} = pkg

  const stories = resolveStories({path})
  const componentPaths = resolveComponents({path, exports})
  const components = mapStories(componentPaths, stories)

  if (verbose && components.length > 0) {
    const emoji = stories.length === 0 ? '⚠️' : '✔️'
    console.log(
      `${emoji} Found ${components.length} shared components and ${stories.length} stories in ${name} (${path})`,
    )
  }

  return {
    name,
    path,
    exports,
    componentInfo,
    components,
    stories,
  }
}

export function getSharedComponents() {
  const workspaces = getWorkspaces()
  const packages = workspaces.map((workspace: Workspace) => {
    return mapWorkspaceToPackages(workspace, false)
  })

  const sharedComponentPaths: string[] = []
  const sharedComponentStoriesPaths: string[] = []
  const sharedComponentsWithoutStoriesPaths: string[] = []
  const sharedPkgs: Package[] = []

  for (const pkg of packages) {
    if (pkg.components.length > 0) {
      sharedPkgs.push(pkg)
      for (const component of pkg.components) {
        sharedComponentPaths.push(component.path)
        if (component.story) {
          sharedComponentStoriesPaths.push(component.story)
        } else {
          sharedComponentsWithoutStoriesPaths.push(component.path)
        }
      }
    }
  }

  return {
    paths: sharedComponentPaths,
    packages: sharedPkgs,
    storiesPaths: sharedComponentStoriesPaths,
    missingStoriesComponentPaths: sharedComponentsWithoutStoriesPaths,
  }
}

function isIgnoredPath(exportPath: unknown) {
  return (
    typeof exportPath != 'string' || EXCLUDED_COMPONENT_PATHS.some(excludedPath => exportPath.endsWith(excludedPath))
  )
}

type PartialPackage = Pick<Package, 'path' | 'exports'>

function resolveComponents(pkg: PartialPackage) {
  if (!pkg.exports) return []
  const exportFiles = normalizeExportFiles(pkg)
  const components: string[] = []
  const possibleBarrelFiles: string[] = []
  for (const file of exportFiles) {
    if (isIgnoredPath(file)) continue
    if (isReactComponentPath(file)) {
      components.push(file)
      continue
    }
    possibleBarrelFiles.push(file)
  }
  const barrelComponents = resolveBarrelFiles(possibleBarrelFiles)

  return [...components, ...barrelComponents]
}

function isReactComponentPath(exportPath: unknown) {
  if (typeof exportPath != 'string') return false
  const isExcludedType =
    exportPath.endsWith('Context.tsx') ||
    exportPath.endsWith('Provider.tsx') ||
    exportPath.includes('/providers/') ||
    exportPath.includes('/hooks/') ||
    exportPath.includes('test-utils/') ||
    exportPath.includes('/use-')
  if (isExcludedType) return false
  return /\.tsx$/.test(exportPath)
}

function normalizeExportFiles(pkg: PartialPackage) {
  const {path, exports} = pkg
  const files: string[] = []
  for (const file of Object.values(exports)) {
    let resolvedFile: string
    if (typeof file === 'string') {
      resolvedFile = file
    } else if (isPlatformExport(file)) {
      resolvedFile = file.default
    } else {
      throw new TypeError(`Export file is of unsupported type: ${typeof file}`)
    }
    files.push(join(path, resolvedFile))
  }
  return files
}

function isPlatformExport(exportPath: unknown): exportPath is PlatformExport {
  if (!exportPath || typeof exportPath != 'object') return false
  return 'default' in exportPath
}

function resolveBarrelFiles(files: string[]) {
  const project = new Project({
    tsConfigFilePath: `${__dirname}/tsconfig.json`,
    skipAddingFilesFromTsConfig: true,
  })
  project.addSourceFilesAtPaths(files)

  const components: string[] = []
  const recurseComponentPaths = (file?: SourceFile) => {
    if (!file) return
    const exportDeclarations = file.getExportDeclarations()
    for (const exportDeclaration of exportDeclarations) {
      if (exportDeclaration.isTypeOnly()) continue
      const moduleSpecifier = exportDeclaration.getModuleSpecifierSourceFile()
      if (moduleSpecifier && isReactComponentPath(moduleSpecifier.getFilePath())) {
        components.push(moduleSpecifier.getFilePath())
      }
      recurseComponentPaths(moduleSpecifier)
    }
  }

  for (const file of project.getSourceFiles()) {
    recurseComponentPaths(file)
  }

  return components
}

function resolveStories(pkg: {path: string}) {
  const allStories = findAllStories()
  const {path} = pkg

  const stories = allStories.filter(story => story.startsWith(path))
  return stories
}

let _allStories: string[] | undefined

function findAllStories() {
  if (_allStories) {
    return _allStories
  }
  _allStories = spawnSync('find', ['../../../', '-name', '*.stories.tsx'])
    .stdout.toString('utf8')
    .split('\n')
    .filter(Boolean)
    .map(path => resolve(path))
  return _allStories
}

function mapStories(componentPaths: string[], stories: string[]) {
  const components: Component[] = []
  for (const path of componentPaths) {
    const story = findStoryForComponent(path, stories)
    components.push({
      path,
      story,
    })
  }
  return components
}

function findStoryForComponent(componentPath: string, storyPaths: string[]) {
  const trimmedComponentPath = componentPath.replace(/\.tsx$/, '.stories.tsx')
  const trimmedComponentFileName = basename(trimmedComponentPath)
  const componentDir = dirname(componentPath)

  return storyPaths.find(
    storyPath => basename(storyPath) === trimmedComponentFileName && dirname(storyPath).startsWith(componentDir),
  )
}
