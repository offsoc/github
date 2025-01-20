import * as fs from 'fs/promises'
import path from 'path'

export const MANIFESTS = new Set(['manifest.json', 'manifest.css.json', 'manifest.static.json', 'manifest.alloy.json'])

interface JSEntry {
  src: string
  files: string[]
}

interface CSSEntry {
  src: string
}

interface AlloyManifest {
  entries: Record<string, string>
  chunks: string[]
  manifest: string
}

export async function getManifestFiles(dir: string): Promise<Set<string>> {
  const jsManifest = await fs.readFile(path.join(dir, 'manifest.json'), 'utf-8')
  const cssManifest = await fs.readFile(path.join(dir, 'manifest.css.json'), 'utf-8')
  const staticManifest = await fs.readFile(path.join(dir, 'manifest.static.json'), 'utf-8')
  const alloyManifest = await fs.readFile(path.join(dir, 'manifest.alloy.json'), 'utf-8')

  const files = new Set<string>()

  for (const entry of Object.values<JSEntry>(JSON.parse(jsManifest))) {
    files.add(entry.src)
  }

  for (const entry of Object.values<CSSEntry>(JSON.parse(cssManifest))) {
    files.add(entry.src)
  }

  for (const entry of Object.values<string>(JSON.parse(staticManifest))) {
    files.add(entry)
  }

  const alloyManifestJSON: AlloyManifest = JSON.parse(alloyManifest)
  for (const entry of alloyManifestJSON.chunks) {
    files.add(entry)
  }

  for (const entry of Object.values(alloyManifestJSON.entries)) {
    files.add(entry)
  }

  files.add(alloyManifestJSON.manifest)

  return files
}
