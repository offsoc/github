const {resolve} = require('node:path')
const {readFile} = require('node:fs/promises')
const glob = require('glob')
const {parse} = require('jsonc-parser')

function alphaSort(key) {
  return (a, b) => {
    if (a[key] < b[key]) {
      return -1
    }
    if (a[key] > b[key]) {
      return 1
    }
    return 0
  }
}

/**
 * @returns {Promise<Array<{path: string, json: unknown}>}
 */
async function loadMetadata(rootDir, env = 'production') {
  const isProd = env === 'production'

  const commandsPath = resolve(rootDir, 'ui/packages/*/commands.json')
  const testCommandsPath = resolve(rootDir, 'ui/packages/*/commands.test.json')

  const paths = [...glob.sync(commandsPath), ...(isProd ? [] : glob.sync(testCommandsPath))]

  return await Promise.all(paths.map(async path => ({path, json: parse(await readFile(path, 'utf8'))})))
}

async function loadCommandsAndServices(rootDir, env = 'production', logger) {
  const metadataJson = await loadMetadata(rootDir, env)

  const flatCommands = []
  const services = []

  for (const {json} of metadataJson) {
    const serviceCommandIds = []

    for (const [commandId, command] of Object.entries(json.commands)) {
      const id = `${json.serviceId}:${commandId}`
      serviceCommandIds.push(id)
      flatCommands.push([id, command])
    }

    services.push([
      json.serviceId,
      {
        id: json.serviceId,
        name: json.serviceName,
        commandIds: serviceCommandIds,
      },
    ])
  }

  const orderedServices = Object.fromEntries(services.sort(alphaSort(0)))
  const orderedCommands = Object.fromEntries(flatCommands.sort(alphaSort(0)))

  logger?.debug(`Command files found: ${metadataJson.length}. Commands compiled: ${Object.keys(flatCommands).length}`)
  logger?.debug(`Services compiled: ${Object.keys(orderedServices).join(', ')}`)
  logger?.debug(`Commands compiled: ${Object.keys(orderedCommands).join(', ')}`)
  return {
    services: orderedServices,
    commands: orderedCommands,
  }
}

module.exports = {loadCommandsAndServices, loadMetadata}
