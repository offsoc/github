import {ContainerClient} from '@azure/storage-blob'
import {ClientSecretCredential} from '@azure/identity'
import {open} from 'node:fs/promises'
import {join, resolve, relative} from 'node:path'
import {env} from 'node:process'
import {sync} from 'glob'
import {getContentType} from './content-types'
import {isIgnoredAsset} from './ignored-assets'

const publicDirectory = resolve(__dirname, '../../../public')
const clientId = env.SPN_STATIC_UI_ASSETS_GITHUB_CI_CLIENT_ID
const tenantId = env.SPN_STATIC_UI_ASSETS_GITHUB_CI_TENANT_ID
const clientSecret = env.SPN_STATIC_UI_ASSETS_GITHUB_CI
const storageUrl = 'https://staticuiassets.blob.core.windows.net/assets'
const webContainerUrl = 'https://staticuiassets.blob.core.windows.net/$web'

interface Stats {
  uploaded: number
  exists: number
  ignored: number
}

const chunkArray = (arr: string[], size: number) => {
  const result = []

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }

  return result
}

// Upload a single asset to Azure Blob Storage
async function uploadAsset({
  asset,
  containerClient,
  stats,
}: {
  asset: string
  containerClient: ContainerClient
  stats: Stats
}) {
  if (isIgnoredAsset(asset)) {
    console.log(`⏭️  Ignoring ${asset}`)
    stats.ignored++
    return
  }

  const blob = containerClient.getBlockBlobClient(asset)

  if (await blob.exists()) {
    // If the blob already exists, we don't need to upload it again
    stats.exists++
    return
  }

  const contentType = getContentType(asset)
  console.log(`⬆️  Uploading ${asset} as ${contentType}`)
  const start = performance.now()

  // Stream the file to blob storage
  const filePath = join(publicDirectory, asset)
  const isCacheable = asset.startsWith('assets/')
  const file = await open(filePath)
  await blob.uploadStream(file.createReadStream(), undefined, undefined, {
    blobHTTPHeaders: {
      blobContentType: contentType,
      blobCacheControl: isCacheable ? 'public, max-age=31536000, immutable' : undefined,
    },
  })

  const durationInSeconds = ((performance.now() - start) / 1000).toFixed(2)
  console.log(`✅ Uploaded ${asset} (${durationInSeconds}s)`)
  stats.uploaded++
}

async function uploadAssets() {
  if (!clientId || !tenantId || !clientSecret) {
    throw new Error('Missing Static UI Assets Azure AD credentials')
  }

  const assets = sync(`${publicDirectory}/**`, {
    nodir: true,
    follow: true,
  }).map(asset => relative(publicDirectory, asset))

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret)
  const containerClient = new ContainerClient(storageUrl, credential)
  const webContainerClient = new ContainerClient(webContainerUrl, credential)
  const uploadStart = performance.now()
  const stats: Stats = {
    uploaded: 0,
    exists: 0,
    ignored: 0,
  }

  const chunkedAssets = chunkArray(assets, 100)

  for (const assetChunk of chunkedAssets) {
    // Kick off 100 uploads in parallel
    await Promise.all(
      assetChunk.map(async asset =>
        Promise.all([
          uploadAsset({
            asset,
            containerClient,
            stats,
          }),
          uploadAsset({
            asset,
            containerClient: webContainerClient,
            stats,
          }),
        ]),
      ),
    )
  }

  console.log(`---------------------------------------`)
  console.log(`⬆️  Uploaded ${stats.uploaded} new assets`)
  console.log(`✨ Skipped ${stats.exists} existing assets`)
  console.log(`⏭️  Ignored ${stats.ignored} assets`)
  const uploadDuration = ((performance.now() - uploadStart) / 1000).toFixed(2)
  console.log(`🚀 Done syncing ${assets.length} assets (${uploadDuration}s)`)
}

// eslint-disable-next-line github/no-then
uploadAssets().catch((error: unknown) => {
  // log a formatted error for build pipelines to pick up
  console.log(`===ERROR===
${JSON.stringify({error: `${error}`}, null, 2)}
===END ERROR===`)

  // log an unformatted error to get full stacktrace in the logs
  console.error(error)

  // Exit with a non-zero exit code so the ci job fails
  process.exit(1)
})
