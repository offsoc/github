import {glob} from 'glob'
import {exec} from 'node:child_process'
import {readFile, writeFile} from 'fs/promises'

function execPromise(command: string) {
  return new Promise((resolve, reject) => {
    const child = exec(command, {cwd: '../../../'}, error => {
      if (error) {
        reject(error)
      }
      resolve(null)
    })
    child.stdout?.pipe(process.stdout)
    child.stderr?.pipe(process.stderr)
  })
}

// A few packages are expected to have nested node_modules
const packagesWithExpectedNesting = ['memex', 'react-next']

function getUnhoistedWorkspaces() {
  // Find all unhoisted node_module files
  const unhoistedFiles = [
    ...glob.sync('../../../npm-workspaces/**/node_modules/**/package.json'),
    ...glob.sync('../../../ui/packages/**/node_modules/**/package.json', {
      ignore: packagesWithExpectedNesting.map(p => `../../../ui/packages/${p}/node_modules/**`),
    }),
  ]

  // Trim down from unhoisted files to just the workspaces which contain unhoisted node_modules
  const packageDirectories = unhoistedFiles.map(file => {
    const split = file.split('/node_modules')
    return split[0]
  })
  const uniquePackageDirectories = [...new Set(packageDirectories)]
  return uniquePackageDirectories
}

async function hoistNodeModules() {
  const unhoistedWorkspaces = getUnhoistedWorkspaces()

  // If no packages are unhoisted, exit
  if (!unhoistedWorkspaces.length) {
    console.log('All node_modules are properly hoisted ✨')
    return
  }

  console.log('Detected unhoisted packages, fixing... 🤖🛠️')

  // Loop over the unhoisted workspaces and grab all packages which are explicitly listed in the workspace package.json
  const dependenciesToInstall = []
  for (const workspaceDirectory of unhoistedWorkspaces) {
    // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
    const packageJson = require(`${workspaceDirectory}/package.json`)
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    }

    // Add the dependencies to the main package.json
    for (const dependency in allDependencies) {
      const dependencyVersion = allDependencies[dependency]
      if (dependencyVersion === '*') {
        // skip dependencies with wildcard versions
        continue
      }
      dependenciesToInstall.push(`${dependency}@${dependencyVersion}`)
    }
  }

  // Grab the main package.json so that we can restore it when we are done
  const originalPackageJson = await readFile('../../../package.json')

  // Run npm install at the top level to hoist the dependencies
  const dependenciesToInstallString = dependenciesToInstall.join(' ')
  console.log(`Installing dependencies: ${dependenciesToInstallString}`)
  await execPromise(`npm i --ignore-scripts --no-fund --no-audit ${dependenciesToInstallString}`)

  // Restore the original main package.json
  await writeFile('../../../package.json', originalPackageJson)

  // Run npm install again to ensure package-lock.json is updated
  await execPromise('npm i --ignore-scripts --no-fund --no-audit')

  const remainingUnhoistedPackages = getUnhoistedWorkspaces()
  if (remainingUnhoistedPackages.length) {
    console.log('❌ Failed to hoist packages in the following workspaces:')
    console.log(remainingUnhoistedPackages.map(p => `  - ${p?.replace('../../../', '')}/package.json`).join('\n'))
  } else {
    console.log('✅ Successfully hoisted all packages')
  }

  console.timeEnd('hoistNodeModules')
}
hoistNodeModules()
