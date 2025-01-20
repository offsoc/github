const {resolve} = require('node:path')
const {mkdir, writeFile, readFile} = require('node:fs/promises')
const {access, constants} = require('node:fs')
const {loadCommandsAndServices} = require('./load-commands-and-services')

module.exports = async function generateFiles(rootDir, logger, {path, file, env}) {
  logger?.time('UI Commands Loaded')
  const json = await loadCommandsAndServices(rootDir, env, logger)
  logger?.timeEnd('UI Commands Loaded')

  logger?.time('UI Commands JSON Compiled')
  await writeCommandFile(rootDir, json, path, file, logger)
  logger?.timeEnd('UI Commands JSON Compiled')
}

const generateFile = async (folderPath, filePath, contents) => {
  await mkdir(folderPath, {recursive: true})
  await writeFile(filePath, contents)
}

/** Promise wrapper around `node:fs:access`. */
async function exists(path) {
  return new Promise(res => access(path, constants.F_OK, err => res(!err)))
}

async function writeCommandFile(rootDir, json, generatedPath, generatedFile, logger) {
  const jsonString = JSON.stringify(json)
  const folderPath = resolve(rootDir, generatedPath)
  const fullPath = resolve(folderPath, `./${generatedFile}.json`)

  const alreadyExists = await exists(fullPath)

  if (!alreadyExists) {
    logger?.debug('::: Generating new UI Commands JSON :::')
    await generateFile(folderPath, fullPath, jsonString)
  } else {
    const currentJson = await readFile(fullPath, 'utf8')
    if (currentJson !== jsonString) {
      logger?.debug('::: Regenerating UI Commands JSON :::')
      await generateFile(folderPath, fullPath, jsonString)
    } else {
      logger?.debug('✔︎ UI Commands JSON is up to date')
    }
  }
}
