import {getSharedComponents, getWorkspaces, mapWorkspaceToPackages} from './utils'
import type {Component, Package} from './utils'

function main() {
  if (process.env.FORMAT === 'list') {
    const {paths} = getSharedComponents()
    console.log(JSON.stringify(paths))
  } else if (process.env.FORMAT === 'json') {
    const sharedComponents = getSharedComponents()
    console.log(JSON.stringify(sharedComponents))
  } else {
    console.time('⏱️')
    const workspaces = getWorkspaces()
    // const workspaces = [{path: '/workspaces/github/ui/packages/date-picker'}]
    const packages = workspaces.map(mapWorkspaceToPackages)
    console.log(`\n👉 Looking for shared components in ${packages.length} packages\n`)

    const componentsByPkg: Component[][] = []
    const sharedPkgs: Package[] = []
    const sharedPkgsWithoutStories: Package[] = []

    for (const pkg of packages) {
      if (pkg.components.length > 0) {
        sharedPkgs.push(pkg)
        componentsByPkg.push(pkg.components)
        if (pkg.stories.length === 0) {
          sharedPkgsWithoutStories.push(pkg)
        }
      }
    }

    const components: Component[] = componentsByPkg.flat()
    const componentsWithoutStories: Component[] = []

    console.log('\n# SHARED COMPONENTS:\n')
    for (const component of components) {
      let emoji = '✔️'
      if (!component.story) {
        emoji = `❌`
        componentsWithoutStories.push(component)
      }
      console.log(`${emoji} ${component.path}`)
    }
    console.log(`\n👉 Found ${components.length} shared components in ${sharedPkgs.length}/${packages.length} packages`)

    if (sharedPkgsWithoutStories.length > 0) {
      console.log('\n# PACKAGES WITHOUT STORIES:\n')
      for (const pkg of sharedPkgsWithoutStories) {
        console.log(`- ${pkg.name} (${pkg.path})`)
      }
      console.log(`\n👉 ${sharedPkgsWithoutStories.length}/${packages.length} packages without stories`)
    }

    if (componentsWithoutStories.length > 0) {
      console.log('\n# COMPONENTS WITHOUT STORIES:\n')
      for (const component of componentsWithoutStories) {
        console.log(`- ${component.path}`)
      }
      console.log(`\n👉 ${componentsWithoutStories.length}/${components.length} shared components without stories`)
    }
    console.timeEnd('⏱️')
  }
}

main()
