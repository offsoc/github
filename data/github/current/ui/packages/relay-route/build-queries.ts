import type {EntryPoint, Environment, PreloadProps} from 'react-relay'
import type {OperationType, Variables} from 'relay-runtime'
import type {ExtractDynamicSegments, QueryConfigs, RouteParams, VariableMappers, VariableTransformer} from './types'

/**
 * Apply variable mappers and optionally transformers
 *
 * If any transformed variable is undefined, the entire set of variables will be undefined
 * `null` can be used though
 */
export function constructVariables<Path extends string, PreloadedQueryProps extends Record<string, OperationType>>(
  variableMappers: VariableMappers<Path, PreloadedQueryProps>,
  transformVariables: VariableTransformer<ExtractDynamicSegments<Path>>,
  routeParams: RouteParams<ExtractDynamicSegments<Path>>,
  relayEnvironment: Environment,
): Variables | undefined {
  const mappedVariables = variableMappers?.(routeParams, relayEnvironment) ?? {}
  const transformed = transformVariables(mappedVariables, routeParams, relayEnvironment)

  /**
   * If we have any variables and any of them are undefined,
   * the entire query will be invalid, so return `undefined` as an indicator
   * that we should not run this query at all
   *
   * An empty object of variables will not be evaluated by this block, so will run
   */
  for (const key in transformed) {
    if (transformed[key] === undefined) {
      return undefined
    }
  }

  return transformed
}

/**
 * Build the preloaded query parameters and variables
 */
export function buildQueries<
  Path extends string,
  PreloadedQueryProps extends Record<string, OperationType>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PreloadedEntryPoints extends Record<string, EntryPoint<any, any> | undefined>,
  ExtraProps extends NonNullable<unknown>,
>(
  queryConfigs: QueryConfigs<Path, PreloadedQueryProps>,
  routeParams: RouteParams<ExtractDynamicSegments<Path>>,
  transformVariables: VariableTransformer<ExtractDynamicSegments<Path>>,
  relayEnvironment: Environment,
) {
  const queries = {} as NonNullable<
    PreloadProps<
      RouteParams<ExtractDynamicSegments<Path>>,
      PreloadedQueryProps,
      PreloadedEntryPoints,
      ExtraProps
    >['queries']
  >

  for (const [key, {concreteRequest, variableMappers}] of typedObjectEntries(queryConfigs)) {
    const variables = constructVariables(variableMappers, transformVariables, routeParams, relayEnvironment)
    // Only keeping valid queries where required variables is defined
    if (variables) {
      queries[key] = {
        variables: Object.fromEntries(
          Object.entries(variables).sort(([keyA], [keyB]) => {
            if (keyA < keyB) return -1
            if (keyA > keyB) return 1
            return 0
          }),
        ),
        parameters: {
          ...concreteRequest,
          params: {
            ...concreteRequest.params,
            metadata: {
              ...concreteRequest.params.metadata,
              isRelayRouteRequest: true,
            },
          },
        },
      }
    }
  }

  return queries
}

/**
 * For reasons `Object.entries` will always type the key as a string, even when given static
 * config objects.  This small helper casts to the expected typings which ties everything together nicely
 */
function typedObjectEntries<T extends Record<string, unknown>>(obj: T) {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}
