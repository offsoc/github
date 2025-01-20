import {access, readFile, writeFile, copyFile, mkdir} from 'node:fs/promises'
import {constants, existsSync} from 'node:fs'
import {resolve, basename, extname, relative} from 'node:path'
import {createHash} from 'node:crypto'
import {glob} from 'glob'

const manifest: {[key: string]: string} = {}
const rootPath = resolve(__dirname, '../../../')
const publicPath = resolve(rootPath, 'public/')
const assetsPath = resolve(rootPath, 'public/assets/')
const destinationPath = resolve(rootPath, process.env.DESTINATION || 'public/assets/')
const manifestPath = resolve(destinationPath, 'manifest.static.json')

const hashFile = async (path: string): Promise<string> => {
  try {
    await access(path, constants.R_OK)
  } catch (e) {
    throw new Error(`Tried to read ${path} but the file could not be accessed.`)
  }
  let contents = ''
  try {
    contents = await readFile(path, 'utf-8')
  } catch (e) {
    throw new Error(`Tried to read ${path} but it could not be read.`)
  }
  return createHash('sha512').update(contents).digest().toString('hex').slice(0, 12)
}

const fingerprintAssets = async () => {
  const assets = glob.sync(`${publicPath}/**`, {
    ignore: `${assetsPath}/**`,
    nodir: true,
    follow: true,
  })

  return Promise.all(
    assets.map(async asset => {
      const hash = await hashFile(asset)
      const ext = extname(asset)
      const name = basename(asset, ext)
      const relativePath = relative(publicPath, asset)

      manifest[relativePath] = `${name}-${hash}${ext}`
    }),
  )
}

const writeManifest = async () => {
  if (!existsSync(destinationPath)) {
    await mkdir(destinationPath, {recursive: true})
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}

fingerprintAssets()
  // eslint-disable-next-line github/no-then
  .then(async () => {
    await Promise.all([
      await writeManifest(),
      ...Object.entries(manifest).map(async ([originalPath, fingerprintedName]) => {
        return await copyFile(resolve(publicPath, originalPath), resolve(destinationPath, fingerprintedName))
      }),
    ])
  })
  // eslint-disable-next-line github/no-then
  .catch((error: unknown) => {
    // log a formatted error for build pipelines to pick up
    console.log(`===ERROR===
${JSON.stringify({error: `${error}`}, null, 2)}
===END ERROR===`)

    // log an unformatted error to get full stacktrace in the logs
    console.error(error)

    // Exit with a non-zero exit code so the ci job fails
    process.exit(1)
  })
