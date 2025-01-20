// @ts-check
/** @type {import('fs')} */
const fs = require('fs')
/** @type {import('node:fs/promises')} */
const {readFile} = require('node:fs/promises')
/** @type {import('node:path')} */
const path = require('node:path')
/** @type {import('./relay.config')} */
const relayConfig = require('./relay.config')
/** @type {import('typescript')} */
const ts = require('typescript')
/** @type {import('./config-paths')} */
const {MAP_FILE_PATH, QUERY_PARAM_TYPES_FILE_PATH, PERSISTED_QUERIES_FILE_PATH} = require('./config-paths')
/** @type {import('./update-query-params-map')} */
const {updateQueryParamsMap} = require('./update-query-params-map')

/**
 * @typedef RouteToQueriesMap
 * @type {Record<string, string[]>}
 */

/**
 * @typedef QueryParamsMap
 * @type {Record<string, Record<string, string>>}
 */

/** @type {<T>(arg: T, message: string) => NonNullable<T>} */
function must(arg, message) {
  if (arg == null) throw new Error(message)
  return arg
}
/** @type {(source: string) => boolean} */
function isRelayRoute(source) {
  return source.includes('relayRoute') && source.includes('registerReactAppFactory')
}

/** @type {(filePath: string) => string | undefined} */
function getRelayRequestIdFromGraphQLFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  // relay export the queryID as a comment in the generated file
  const matches = [...content.matchAll(/\/\/\s@relayRequestID\s([0-9a-fA-F]+)\n/g)][0]

  if (matches && matches.length > 0) {
    // eg. ISSUES_INDEX_QUERY : da0d588670b0549df8eac448121e3422
    return matches[1]
  }
}

/** @type {(sourceFile: import("typescript").SourceFile, resourcePath: string) => Record<string, string>} */
function getRouteQueries(sourceFile, resourcePath) {
  /** @type {Record<string, string>} */
  const routeQueries = {}
  ts.forEachChild(sourceFile, node => {
    // create a map of graphQL query name to queryID
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.getText(sourceFile) &&
      node.moduleSpecifier.getText(sourceFile).match(/.*\/__generated__\/.*\$parameters/) &&
      node.importClause &&
      node.importClause.name
    ) {
      // import looks like
      // import type ISSUES_INDEX_QUERY from './__generated__/IssuesIndexQuery$parameters'

      // read the imported graphQL file
      const importedFileSourcePath = node.moduleSpecifier.getText(sourceFile).replaceAll(`'`, '')
      const gQLFilePath = path.join(path.dirname(resourcePath), `${importedFileSourcePath}.ts`)
      const relayQueryId = getRelayRequestIdFromGraphQLFile(gQLFilePath)
      if (relayQueryId) {
        routeQueries[node.importClause.name.escapedText.toString()] = relayQueryId
      }
    } else if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.getText(sourceFile) &&
      node.moduleSpecifier.getText(sourceFile).match(/.*\/__generated__\/.*graphql/) &&
      node.importClause &&
      node.importClause.name
    ) {
      // import looks like
      // import type { ISSUES_INDEX_QUERY } from './__generated__/IssuesIndexQuery.graphql'

      // read the imported graphQL file
      const importedFileSourcePath = node.moduleSpecifier.getText(sourceFile).replaceAll(`'`, '')
      const gQLFilePath = path.join(path.dirname(resourcePath), `${importedFileSourcePath}.ts`)
      const relayQueryId = getRelayRequestIdFromGraphQLFile(gQLFilePath)
      if (relayQueryId) {
        routeQueries[node.importClause.name.escapedText.toString()] = relayQueryId
      }
    } else if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.getText(sourceFile) &&
      node.moduleSpecifier.getText(sourceFile).match(/'@github-ui\/([a-zA-Z-]+)\/.*graphql'/) &&
      node.importClause &&
      node.importClause.name
    ) {
      // import looks like
      // import ISSUE_VIEWER_PARALLEL_TIMELINE_QUERY from '@github-ui/issue-viewer/IssueViewerParallelTimelineQuery.graphql'

      // extract the package name using the reg exp
      const packageName = must(
        node.moduleSpecifier.getText(sourceFile).match(/'@github-ui\/([a-zA-Z-]+)\/[a-zA-Z-_.]+'/)?.[1],
        'packageName must be defined',
      ) // eg. issue-viewer
      const moduleName = must(
        node.moduleSpecifier.getText(sourceFile).match(/'@github-ui\/[a-zA-Z-]+\/([a-zA-Z-_.]+)'/)?.[1],
        'moduleName must be defined',
      ) // eg. IssueViewerParallelTimelineQuery.graphql

      // read the package.json file to get the exports
      const packageJsonFilePath = path.join('ui/packages', packageName, 'package.json')
      const packageJsonFileContent = fs.readFileSync(packageJsonFilePath, 'utf-8')
      const packageJson = JSON.parse(packageJsonFileContent)

      // read the exported file to get the queryID
      if (packageJson.exports && packageJson.exports[`./${moduleName}`]) {
        const gQLFilePath = path.join('ui/packages', packageName, packageJson.exports[`./${moduleName}`])
        const relayQueryId = getRelayRequestIdFromGraphQLFile(gQLFilePath)
        if (relayQueryId) {
          routeQueries[node.importClause.name.escapedText.toString()] = relayQueryId
        }
      }
    } else if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.getText(sourceFile) &&
      node.moduleSpecifier.getText(sourceFile).match(/'@github-ui\/([a-zA-Z-]+)'/) &&
      node.importClause &&
      node.importClause.getText(sourceFile) &&
      node.importClause.getText(sourceFile).match(/\b([A-Z0-9_]+)_QUERY\b/)
    ) {
      // import looks like
      // import { ISSUES_INDEX_QUERY } from '@github-ui/issues'

      // extract the package name using the reg exp
      const packageName = must(
        node.moduleSpecifier.getText(sourceFile).match(/'@github-ui\/([a-zA-Z-]+)'/)?.[1],
        'packageName must be defined',
      )
      const packageIndexFilePath = path.join('ui/packages', packageName, 'index.ts')
      const packageIndexFileContent = fs.readFileSync(packageIndexFilePath, 'utf-8')
      const importedType = node.importClause.getText(sourceFile)

      const exportSourceFile = ts.createSourceFile(
        'index.ts', // file name
        packageIndexFileContent, // file content
        ts.ScriptTarget.Latest, // language version
        true, // set 'setParentNodes' option to true
      )

      const query_types = importedType.matchAll(/\b([A-Z0-9_]+)_QUERY\b/g)
      // go over each group in the match
      for (const query_type of query_types) {
        /** @type {string} */
        const query_type_string = must(query_type[1], 'invalid query type name')

        ts.forEachChild(exportSourceFile, exportSourceNode => {
          if (
            ts.isExportDeclaration(exportSourceNode) &&
            exportSourceNode.exportClause?.getText(exportSourceFile) &&
            exportSourceNode.exportClause.getText(exportSourceFile).indexOf(query_type_string) > 0
          ) {
            const fileSourceRelativePath = exportSourceNode.moduleSpecifier
              ?.getText(exportSourceFile)
              .replaceAll(`'`, '')
            const fileSourcePath = path.join(`ui/packages/${packageName}`, `${fileSourceRelativePath}.ts`)

            const relayQueryId = getRelayRequestIdFromGraphQLFile(fileSourcePath)
            if (relayQueryId) {
              routeQueries[`${query_type_string}_QUERY`] = relayQueryId
            }
          }
        })
      }
    }
  })
  return routeQueries
}

/** @type {(sourceFile: import("typescript").SourceFile, routeQueries: Record<string, string>, routesToQueriesMap: RouteToQueriesMap) => {routeToQueriesMap: RouteToQueriesMap}} */
function updateRouteToQueryMap(sourceFile, routeQueries, routeToQueriesMap) {
  ts.forEachChild(sourceFile, node => {
    if (
      ts.isExpressionStatement(node) &&
      ts.isCallExpression(node.expression) &&
      node.expression.expression.getText(sourceFile) === 'registerReactAppFactory' &&
      node.expression.arguments.length === 2
    ) {
      // arguments[1] is the callback (2nd argument) in registerReactAppFactory
      const options = node.expression.arguments[1]
      if (!ts.isFunctionLike(options)) {
        throw new Error('must be a function with a block body or a short return')
      }
      const returnStatement =
        ts.isBlock(options.body) && options.body.statements.length && options.body.statements.length - 1 >= 0
          ? options.body.statements[options.body.statements.length - 1]
          : options.body
      if (
        !returnStatement ||
        !(ts.isReturnStatement(returnStatement) || ts.isParenthesizedExpression(returnStatement)) ||
        !returnStatement.expression ||
        !ts.isObjectLiteralExpression(returnStatement.expression)
      ) {
        throw new Error('body must return an object literal expression')
      }

      const routes = returnStatement.expression.properties.find(prop => prop.name?.getText(sourceFile) === 'routes')
      if (
        !routes ||
        !ts.isPropertyAssignment(routes) ||
        !routes.initializer ||
        !ts.isArrayLiteralExpression(routes.initializer) ||
        !routes.initializer.elements
      ) {
        throw new Error(`Please assign the routes directly to the routes property.
          Eg. routes: [
            relayRoute({ ... })
          ]

          Avoid using global variables or function calls
            ❌ routes: myRoutes()
            ❌ const myRoutes = [] => routes: myRoutes
        `)
      }
      // extract all the relayRoutes
      const relayRoutes = routes.initializer.elements.filter(
        route => ts.isCallExpression(route) && route.expression.getText(sourceFile) === 'relayRoute',
      )

      // for each relayRoute, get the path and map it to the queries
      for (const route of relayRoutes) {
        if (!ts.isCallExpression(route)) throw new Error('Routes must be a call expression')
        const relayRouteArg = route.arguments[0]
        if (!relayRouteArg || !ts.isObjectLiteralExpression(relayRouteArg)) throw new Error()
        const pathObj = relayRouteArg.properties.find(prop => prop.name?.getText(sourceFile) === 'path')
        if (!pathObj || !ts.isPropertyAssignment(pathObj) || !ts.isStringLiteral(pathObj.initializer)) {
          throw new Error('Path must be defined a a string literal')
        }
        const pathValue = pathObj.initializer.text // <-- this is the path
        const queriesObj = relayRouteArg.properties.find(prop => prop.name?.getText(sourceFile) === 'queryConfigs')
        if (
          !queriesObj ||
          !ts.isPropertyAssignment(queriesObj) ||
          !ts.isObjectLiteralExpression(queriesObj.initializer)
        ) {
          throw new Error('queriesConfig must be defined as an object literal')
        }
        /** @type {string[]} */
        const queries = []
        /** @type {string | undefined} */
        let queryId
        // for every query get the name and the variables
        for (const query of queriesObj.initializer.properties) {
          if (!ts.isPropertyAssignment(query) || !ts.isObjectLiteralExpression(query.initializer)) throw new Error('')
          for (const prop of query.initializer.properties) {
            if (!ts.isPropertyAssignment(prop)) throw new Error('must be property assignment')
            if (prop.name.getText(sourceFile) === 'concreteRequest') {
              if (!ts.isIdentifier(prop.initializer)) throw new Error('invalid identifier')
              queryId = routeQueries[prop.initializer.escapedText.toString()]
              if (!queryId) {
                throw new Error(`Could not find query ${prop.initializer.escapedText.toString()} in routeQueries`)
              }
              queries.push(queryId)
            }
          }
        }

        routeToQueriesMap[pathValue] = queries
      }
    }
  })
  return {routeToQueriesMap}
}

/** @type {(resourcePath: string, source: string, routesToQueriesMap: RouteToQueriesMap) => {routeToQueriesMap: RouteToQueriesMap}} */
function generateRouteToQueriesMap(resourcePath, source, routeToQueriesMap) {
  const sourceFile = ts.createSourceFile(
    resourcePath, // file name
    source, // file content
    ts.ScriptTarget.Latest, // language version
    true, // set 'setParentNodes' option to true
  )

  const routeQueries = getRouteQueries(sourceFile, resourcePath)

  const {routeToQueriesMap: updatedRouteToQueriesMap} = updateRouteToQueryMap(
    sourceFile,
    routeQueries,
    routeToQueriesMap,
  )

  return {routeToQueriesMap: updatedRouteToQueriesMap}
}

module.exports.generateRouteToQueriesMap = generateRouteToQueriesMap
module.exports.getRouteQueries = getRouteQueries
module.exports.updateRouteToQueryMap = updateRouteToQueryMap

/** @type {(options: {routeToQueriesMap: RouteToQueriesMap}) => Promise<{routeToQueriesMap: RouteToQueriesMap}>} */
module.exports.generateRouteToQueries = async function ({routeToQueriesMap}) {
  const sourceDirectories = Object.keys(relayConfig.sources)
  const timeKey = 'Execution Time for RouteToQueriesPlugin'
  console.time(timeKey)
  /** @type {{routeToQueriesMap: RouteToQueriesMap}} */
  let result = {routeToQueriesMap: {}}

  // Find relay index files and generate routes from them
  for (const sourceDirectory of sourceDirectories) {
    try {
      // TODO: support other file names than index.ts
      const file = path.join(sourceDirectory, 'index.ts')
      const source = await readFile(file, 'utf-8')

      if (isRelayRoute(source)) {
        result = generateRouteToQueriesMap(file, source, routeToQueriesMap)
      }
    } catch (_) {
      // unable to read the file. likely no index.ts exists for this relay directory
    }
  }

  console.timeEnd(timeKey)
  return result
}

/** @type {() => Promise<void>} */
module.exports.main = async function () {
  const routeToQueriesMap = fs.existsSync(MAP_FILE_PATH) ? JSON.parse(fs.readFileSync(MAP_FILE_PATH, 'utf-8')) : {}
  const queryParamTypes = fs.existsSync(QUERY_PARAM_TYPES_FILE_PATH)
    ? JSON.parse(fs.readFileSync(QUERY_PARAM_TYPES_FILE_PATH, 'utf-8'))
    : {}

  const persistedQueryConfigFiles = fs.existsSync(PERSISTED_QUERIES_FILE_PATH)
    ? fs.readdirSync(PERSISTED_QUERIES_FILE_PATH)
    : []

  const persistedQueryConfigSources = persistedQueryConfigFiles.map(fileSubPath =>
    JSON.parse(fs.readFileSync(path.join(PERSISTED_QUERIES_FILE_PATH, fileSubPath), 'utf-8')),
  )

  const response = await module.exports.generateRouteToQueries({
    routeToQueriesMap,
  })

  updateQueryParamsMap(queryParamTypes, persistedQueryConfigSources)

  fs.writeFileSync(MAP_FILE_PATH, JSON.stringify(response.routeToQueriesMap))
  fs.writeFileSync(QUERY_PARAM_TYPES_FILE_PATH, JSON.stringify(queryParamTypes))
}
