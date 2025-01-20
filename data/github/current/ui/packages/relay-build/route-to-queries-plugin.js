// @ts-check
/** @type {import('node:fs')} */
const fs = require('node:fs')
/** @type {import('node:path')} */
const path = require('node:path')
/** @type {import('node:fs/promises')} */
const {writeFile} = require('node:fs/promises')
/** @type {import('./generate-route-to-queries')} */
const {generateRouteToQueries} = require('./generate-route-to-queries')
/** @type {import('./config-paths')} */
const {MAP_FILE_PATH, QUERY_PARAM_TYPES_FILE_PATH} = require('./config-paths')
/** @type {import('./update-query-params-map')} */
const {updateQueryParamsMap} = require('./update-query-params-map')
/** @type {import('./config-paths')} */
const {PERSISTED_QUERIES_FILE_PATH} = require('./config-paths')

/**
 * @class
 */
class RouteToQueriesPlugin {
  /** @param {{debug?: boolean}} options */
  constructor(options) {
    try {
      this.routeToQueriesMap = fs.existsSync(MAP_FILE_PATH) ? JSON.parse(fs.readFileSync(MAP_FILE_PATH, 'utf-8')) : {}
    } catch (error) {
      console.error(`Error parsing routeToQueriesMap (${MAP_FILE_PATH}) file`, error)
      this.routeToQueriesMap = {}
    }
    try {
      this.queryParamTypes = fs.existsSync(QUERY_PARAM_TYPES_FILE_PATH)
        ? JSON.parse(fs.readFileSync(QUERY_PARAM_TYPES_FILE_PATH, 'utf-8'))
        : {}
    } catch (error) {
      console.error(`Error parsing queryParamTypes (${QUERY_PARAM_TYPES_FILE_PATH}) file`, error)
      this.queryParamTypes = {}
    }

    this.persistedQueryConfigSources = fs
      .readdirSync(PERSISTED_QUERIES_FILE_PATH)
      .map(fileSubPath => JSON.parse(fs.readFileSync(path.join(PERSISTED_QUERIES_FILE_PATH, fileSubPath), 'utf-8')))

    this.debug = options.debug || false
  }

  /**
   * Apply the plugin.
   * @type {(compiler: import('webpack').Compiler) => Promise<void>} compiler - The Webpack compiler instance.
   */
  async apply(compiler) {
    compiler.hooks.afterCompile.tapPromise('RouteToQueriesPlugin', async () => {
      const {routeToQueriesMap} = await generateRouteToQueries({
        routeToQueriesMap: this.routeToQueriesMap,
      })

      updateQueryParamsMap(this.queryParamTypes, this.persistedQueryConfigSources)

      if (this.debug) {
        console.log('Resulting: routeToQueriesMap')
        console.log(routeToQueriesMap)
        console.log('Resulting: queryParamTypes')
        console.log(this.queryParamTypes)
      }

      // write the routeToQueriesMap to a file
      await Promise.all([
        writeFile(MAP_FILE_PATH, JSON.stringify(routeToQueriesMap)),
        writeFile(QUERY_PARAM_TYPES_FILE_PATH, JSON.stringify(this.queryParamTypes)),
      ])
    })
  }
}

module.exports = RouteToQueriesPlugin
