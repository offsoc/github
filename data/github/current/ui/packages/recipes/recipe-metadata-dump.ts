import {readFileSync, writeFileSync} from 'fs'
import {join as joinPaths, resolve as resolvePath, dirname as pathDirname, relative as relativePath} from 'path'
import {glob} from 'glob'
import {load as yamlLoad} from 'js-yaml'

type StoryComponent = {
  component: string
  storyIds: string[]
  meta: SharedComponentMeta
}

type SharedComponentMeta = {
  id: string
  name: string
  path: string
  status: string
}

type Manifest = {
  components: SharedComponentMeta[]
}

class StoryMap {
  private storyIdsByPath: {[key: string]: string[]}

  constructor() {
    this.storyIdsByPath = {}
  }

  add(path: string, storyId: string): void {
    const normPath = this.#normalizePath(path)

    if (!this.storyIdsByPath[normPath]) {
      this.storyIdsByPath[normPath] = []
    }

    this.storyIdsByPath[normPath].push(storyId)
  }

  get(path: string): string[] {
    if (path) {
      const normPath = this.#normalizePath(path)
      return this.storyIdsByPath[normPath] || []
    } else {
      return []
    }
  }

  #normalizePath(path: string): string {
    let normalizedPath = path

    if (normalizedPath.startsWith('./')) {
      normalizedPath = normalizedPath.slice(2)
    }

    if (normalizedPath.endsWith('.stories.tsx')) {
      normalizedPath = normalizedPath.slice(0, normalizedPath.indexOf('.stories.tsx'))
    }

    return normalizedPath
  }
}

const main = () => {
  if (process.argv[2] !== '--stories-json' || !process.argv[3]) {
    throw new Error("Please pass the --stories-json option and provide a path to Storybook's stories.json file")
  }

  const root = resolvePath(__dirname, '..', '..', '..')
  const storiesJsonPath = process.argv[3]
  const recipeMetadata = getRecipeMetadata(root)
  const storiesJson = JSON.parse(readFileSync(storiesJsonPath, 'utf8'))
  const storyMap = new StoryMap()

  for (const entryId of Object.keys(storiesJson.entries)) {
    const importPath: string = storiesJson.entries[entryId].importPath

    if (importPath.endsWith('.stories.tsx')) {
      storyMap.add(importPath, entryId)
    }

    const storiesImports = storiesJson.entries[entryId].storiesImports

    if (storiesImports && storiesImports.length > 0) {
      storyMap.add(storiesImports[0], entryId)
    }
  }

  const components = recipeMetadata.map(recipeMeta => {
    const component = recipeMeta.name

    const result: StoryComponent = {
      component,
      storyIds: [],
      meta: recipeMeta,
    }

    const storyPath = recipeMeta.path.slice(0, recipeMeta.path.indexOf('.tsx'))
    const ids = storyMap.get(storyPath)

    if (ids) {
      result.storyIds = ids
    }

    return result
  })

  writeFileSync('./recipe_metadata.json', JSON.stringify(components, null, 2))
}

const getRecipeMetadata = (root: string): SharedComponentMeta[] => {
  const paths = glob.sync(joinPaths(root, 'ui/packages/*/recipes.yml'))
  const components: SharedComponentMeta[] = []

  for (const p of paths) {
    const manifest = yamlLoad(readFileSync(p, 'utf8')) as Manifest
    const dirname = pathDirname(p)

    for (const component of manifest.components) {
      components.push({
        ...component,
        path: relativePath(root, joinPaths(dirname, component.path)),
      })
    }
  }

  return components
}

main()
