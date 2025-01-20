// @ts-check
/** @type {import('child_process')} */
const {execSync} = require('child_process')
/** @type {import('node:fs')} */
const {writeFileSync, existsSync, mkdirSync, rmSync} = require('node:fs')
/** @type {import('./config-paths')} */
const {pathFromRoot, QUERY_PARAM_TYPES_FILE_PATH, MAP_FILE_PATH} = require('./config-paths')

// Once we remove the committed queries for Memex this script
// will start failing because the persisted_graphql_queries
// may not be present. This check will ensure the setup before
// launching relay-compiler works as expected.
if (!existsSync(pathFromRoot('config/persisted_graphql_queries'))) {
  mkdirSync(pathFromRoot('config/persisted_graphql_queries'))
}

if (!existsSync(pathFromRoot('config/persisted_graphql_queries/github_ui.json'))) {
  writeFileSync(pathFromRoot('config/persisted_graphql_queries/github_ui.json'), '')
}

if (existsSync(QUERY_PARAM_TYPES_FILE_PATH)) {
  rmSync(QUERY_PARAM_TYPES_FILE_PATH)
}
if (existsSync(MAP_FILE_PATH)) {
  rmSync(MAP_FILE_PATH)
}

execSync(`node_modules/.bin/relay-compiler --repersist`, {
  stdio: 'inherit',
  env: {...process.env, PATH: `${process.env.PATH}:${pathFromRoot('bin')}`}, // need to add bin to path for access to node binary
})

require('./generate-route-to-queries').main()
require('./generate-serviceowners').main()
