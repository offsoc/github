// @ts-check
/** @type {import('graphql')} */
const {Kind, parse} = require('graphql')

module.exports = {
  updateQueryParamsMap,
}

/**
 * @type {(queryParamsMap: Record<string, Record<string, string>>, persistedQueryConfigs: Array<Record<string, string>>) => void}
 *
 * Given a current version of the query parameters hash and a list of the persisted query files
 * Extract the variables from each query and map that back onto their hash, outputting a single file of all
 * hashes mapped to their variables
 */
function updateQueryParamsMap(queryParamsMap, persistedQueryConfigs) {
  for (const persistedQueries of persistedQueryConfigs) {
    for (const [hash, query] of Object.entries(persistedQueries)) {
      try {
        const parsedQuery = parse(query)
        queryParamsMap[hash] = extractVariableTypes(parsedQuery)
      } catch (e) {
        console.error(`Failed to parse query $hash=${hash}`)
        throw e
      }
    }
  }
}

/**
 * @type {(ast: import('graphql').DocumentNode) => Record<string, string>}
 *
 * Given a grapqhl AST (a parsed query / DocumentNode)
 * Map over variables for the query definition and for each variable
 * definition and extract the type definition from the AST.
 *
 */
function extractVariableTypes(ast) {
  /** @type {Record<string, string>} */
  const variableTypes = {}
  // Visit each definition in the AST
  for (const definition of ast.definitions) {
    // Check if the definition is a variable definition
    if (definition.kind === Kind.OPERATION_DEFINITION && definition.variableDefinitions) {
      // Iterate over variable definitions
      for (const variableDefinition of definition.variableDefinitions) {
        // Add variable name and type to the map
        const variableName = variableDefinition.variable.name.value
        variableTypes[variableName] = extractType(variableDefinition.type)
      }
    }
  }

  return variableTypes
}

/**
 * @type {(variableType: import('graphql').TypeNode) => string}
 *
 * Recursively extract the GraphQL type of a variable definition from the AST
 *
 */
function extractType(variableType) {
  switch (variableType.kind) {
    case Kind.NAMED_TYPE: {
      return variableType.name.value
    }
    case Kind.LIST_TYPE: {
      return `[${extractType(variableType.type)}]`
    }
    case Kind.NON_NULL_TYPE: {
      return `${extractType(variableType.type)}!`
    }
    default: {
      // @ts-expect-error kind is handled exhaustively
      throw new Error(`${variableType.kind} is not handled`)
    }
  }
}
