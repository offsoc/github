// @ts-check
/** @type {import('node:path')} */
const {join} = require('node:path')

/** @type {(relativePath: string) => string} */
function pathFromRoot(relativePath) {
  return join(__dirname, '../../../', relativePath)
}

module.exports.pathFromRoot = pathFromRoot
module.exports.MAP_FILE_PATH = pathFromRoot('config/route_to_queries_map.json')
module.exports.QUERY_PARAM_TYPES_FILE_PATH = pathFromRoot('config/query_param_types.json')
module.exports.SERVICE_OWNERS_FILE_PATH = pathFromRoot('config/persisted_graphql_queries_by_serviceowner/')
module.exports.PERSISTED_QUERIES_FILE_PATH = pathFromRoot('config/persisted_graphql_queries')
