import {promises as fs} from 'fs'
import * as path from 'path'
import {getManifestFiles, MANIFESTS} from '../lib/parse-manifests'

const allowedExtraFiles = MANIFESTS

let manifest: Set<string> | null = null
async function fileInManifest(file: string): Promise<boolean> {
  if (!manifest) {
    manifest = await getManifestFiles(path.dirname(file))
  }

  return manifest.has(path.basename(file))
}

function extraManifestFiles(set: Set<string>): string[] {
  return Array.from(manifest!).filter(file => !set.has(file))
}

async function main() {
  const dir = path.resolve(process.argv[2] || 'public/assets')
  const seen: Set<string> = new Set()
  const errors: Error[] = []
  for (const file of await fs.readdir(dir)) {
    const filePath = path.join(dir, file)
    // Ignore map files
    if (file.endsWith('.map')) {
      seen.add(file)
      continue
    }

    if (allowedExtraFiles.has(file)) {
      continue
    }

    // Check the manifest has the entry
    if (await fileInManifest(filePath)) {
      seen.add(file)

      continue
    }

    const pathName = path.join(dir, file)
    const stat = await fs.lstat(pathName)
    if (stat.isSymbolicLink()) {
      const linked = await fs.readlink(pathName)
      if (await fileInManifest(filePath)) {
        seen.add(linked)
      }
      if (!seen.has(linked)) {
        errors.push(new Error(`Saw extraneous symlink: ${file} -> ${linked}`))
        continue
      }
      seen.add(file)
    }

    if (!seen.has(file)) {
      errors.push(new Error(`Saw file not in manifest.json: ${file}`))
    }
  }

  const remainder = extraManifestFiles(seen).map(file => new Error(`Did not see file listed in manifest: ${file}`))
  const allErrors = [...errors, ...remainder]
  for (const error of allErrors) {
    console.error(error.message)
  }
  console.log(`Scanned ${seen.size} files. Manifest check ${allErrors.length ? 'failed' : 'passed'}.`)
  process.exit(allErrors.length)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
