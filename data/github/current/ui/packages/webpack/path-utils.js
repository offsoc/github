// @ts-check
const {resolve, relative} = require('node:path')
const glob = require('glob')

const rootPath = resolve(__dirname, '../../../')
module.exports.rootPath = rootPath

/** @type {(relativePath: string) => string} */
function pathFromRoot(relativePath) {
  return resolve(rootPath, relativePath)
}
module.exports.pathFromRoot = pathFromRoot

/** @type {(relativePath: string) => string} */
module.exports.relativePathFromRoot = relativePath => {
  return relative(rootPath, relativePath)
}

/** @type {(relativePath: string) => string[]} */
module.exports.globFromRoot = relativePath => {
  return glob.sync(pathFromRoot(relativePath))
}
