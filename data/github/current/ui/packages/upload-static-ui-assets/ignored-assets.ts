import {basename} from 'node:path'

export function isIgnoredAsset(path: string) {
  const asset = basename(path)
  // Ignore manifest.json, manifest.css.json, etc. These ship with the Rails server and don't need to be on the CDN
  return asset.startsWith('manifest.') && asset.endsWith('.json')
}
