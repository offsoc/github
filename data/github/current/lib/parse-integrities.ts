import {getManifest} from './parse-manifests'

export async function getIntegrities(dir: string): Promise<[string, string][]> {
  const integrities: [string, string][] = []

  const manifest = await getManifest(dir)

  for (const entry of manifest) {
    integrities.push([entry.src, entry.integrity])
  }

  return integrities
}
