import {getRouteQueries, updateRouteToQueryMap} from '../generate-route-to-queries'
import ts from 'typescript'
import fs from 'fs'

jest.mock('fs')
const mockedReadFileSync = jest.mocked(fs.readFileSync)

describe('generateRouteToQueries', () => {
  it('Test that getRouteQueries returns the correct query import name to query mapping using relative import', () => {
    const source = `
      import {registerReactAppFactory} from '@github-ui/react-core/register-app'
      import TASK_LIST_PAGE_QUERY from './pages/__generated__/TaskListPageQuery.graphql'
      import {TaskListPage} from './pages/TaskListPage'
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )
    const graphQLText = `
      // @ts-nocheck

      // @relayRequestID 3dca38ca6b50c0eb980488f5faaa478b

      import { ConcreteRequest, Query } from 'relay-runtime';
    `
    mockedReadFileSync.mockReturnValue(graphQLText)

    const result = getRouteQueries(sourceFile, resourcePath)
    expect(mockedReadFileSync).toHaveBeenCalledWith(
      'app/assets/modules/tasks-hierarchy/pages/__generated__/TaskListPageQuery.graphql.ts',
      'utf-8',
    )
    expect(result).toEqual({
      TASK_LIST_PAGE_QUERY: '3dca38ca6b50c0eb980488f5faaa478b',
    })
  })

  it('Test that getRouteQueries returns the correct query import name to query mapping using package.json import', () => {
    const source = `
      import {registerReactAppFactory} from '@github-ui/react-core/register-app'
      import {SomeComponent} from '@github-ui/package-name'
      import QUERY1_QUERY from '@github-ui/package-name/mainQuery.graphql'
      import {TaskListPage} from './pages/TaskListPage'
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )

    mockedReadFileSync.mockImplementation(path => {
      switch (path) {
        case 'ui/packages/package-name/package.json':
          return `
          {
            "name": "@github-ui/package-name",
            "exports": {
              "./mainQuery.graphql": "./components/__generated__/mainQuery.graphql.ts"
            }
          }
        `
        case 'ui/packages/package-name/components/__generated__/mainQuery.graphql.ts':
          return `
          // @ts-nocheck
          // @relayRequestID abcdef1
          import { ConcreteRequest, Query } from 'relay-runtime';
        `
        default:
          throw new Error(`Unexpected path: ${path}`)
      }
    })

    const result = getRouteQueries(sourceFile, resourcePath)

    expect(result).toEqual({
      QUERY1_QUERY: 'abcdef1',
    })
  })

  it('Test that getRouteQueries returns the correct query import name to query mapping using package import, one query', () => {
    const source = `
      import {registerReactAppFactory} from '@github-ui/react-core/register-app'
      import {SomeComponent} from '@github-ui/package-name'
      import {QUERY1_QUERY} from '@github-ui/package-name'
      import {TaskListPage} from './pages/TaskListPage'
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )

    mockedReadFileSync.mockImplementation(path => {
      switch (path) {
        case 'ui/packages/package-name/index.ts':
          return `
          export {ItemPicker} from './components/ItemPicker'
          export {default as QUERY1_QUERY} from './components/__generated__/File1.graphql'
        `
        case 'ui/packages/package-name/components/__generated__/File1.graphql.ts':
          return `
          // @ts-nocheck
          // @relayRequestID abcdef1
          import { ConcreteRequest, Query } from 'relay-runtime';
        `
        default:
          throw new Error('Unexpected path')
      }
    })

    const result = getRouteQueries(sourceFile, resourcePath)

    expect(result).toEqual({
      QUERY1_QUERY: 'abcdef1',
    })
  })

  it('Test that getRouteQueries returns the correct query import name to query mapping using package import, two queries', () => {
    const source = `
      import {registerReactAppFactory} from '@github-ui/react-core/register-app'
      import {QUERY1_QUERY, QUERY2_QUERY} from '@github-ui/package-name'
      import {TaskListPage} from './pages/TaskListPage'
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )

    mockedReadFileSync.mockImplementation(path => {
      switch (path) {
        case 'ui/packages/package-name/index.ts':
          return `
          export {ItemPicker} from './components/ItemPicker'
          export {default as QUERY1_QUERY} from './components/__generated__/File1.graphql'
          export {default as QUERY2_QUERY} from './components/__generated__/File2.graphql'
        `
        case 'ui/packages/package-name/components/__generated__/File1.graphql.ts':
          return `
          // @ts-nocheck
          // @relayRequestID abcdef1
          import { ConcreteRequest, Query } from 'relay-runtime';
        `
        case 'ui/packages/package-name/components/__generated__/File2.graphql.ts':
          return `
          // @ts-nocheck
          // @relayRequestID abcdef2
          import { ConcreteRequest, Query } from 'relay-runtime';
        `
        default:
          throw new Error('Unexpected path')
      }
    })

    const result = getRouteQueries(sourceFile, resourcePath)

    expect(result).toEqual({
      QUERY1_QUERY: 'abcdef1',
      QUERY2_QUERY: 'abcdef2',
    })
  })

  it('Test that updateRouteToQueryMap updates the routeToQueryMap with the correct query import name to query mapping', () => {
    const source = `
    registerReactAppFactory('tasks-hierarchy', () => {
      return {
        App,
        routes: [
          relayRoute({
            path: '/:owner/:repo/issues/:number/tasks',
            queryConfigs: {
              taskListQuery: {
                concreteRequest: TASK_LIST_PAGE_QUERY,
                variableMappers: routeParams => {
                  return {
                    owner: routeParams.pathParams['owner'],
                    repo: routeParams.pathParams['repo'],
                    number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
                  }
                },
              },
            },
          }),
        ],
      }
    })
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )
    const routeQueries = {
      TASK_LIST_PAGE_QUERY: '3dca38ca6b50c0eb980488f5faaa478b',
    }
    const {routeToQueriesMap} = updateRouteToQueryMap(sourceFile, routeQueries, {})
    expect(routeToQueriesMap).toEqual({
      '/:owner/:repo/issues/:number/tasks': ['3dca38ca6b50c0eb980488f5faaa478b'],
    })
  })

  it('Test that updateRouteToQueryMap updates the routeToQueryMap with the correct query import name to query mapping for multiple queries', () => {
    const source = `
    registerReactAppFactory('tasks-hierarchy', () => {
      return {
        App,
        routes: [
          relayRoute({
            path: '/:owner/:repo/issues/:number/tasks',
            queryConfigs: {
              taskListQuery: {
                concreteRequest: TASK_LIST_PAGE_QUERY,
                variableMappers: routeParams => {
                  return {
                    owner: routeParams.pathParams['owner'],
                    repo: routeParams.pathParams['repo'],
                    number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
                  }
                },
              },
              randomQuery: {
                concreteRequest: RANDOM_QUERY,
                variableMappers: routeParams => {
                  return {
                    includeReaction: routeParams.pathParams['owner'] === 'true',
                  }
                },
              },
              anotherRandomQuery: {
                concreteRequest: ANOTHER_RANDOM_QUERY,

              },
            },
          }),
        ],
      }
    })
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )
    const routeQueries = {
      TASK_LIST_PAGE_QUERY: '3dca38ca6b50c0eb980488f5faaa478b',
      RANDOM_QUERY: '111',
      ANOTHER_RANDOM_QUERY: '222',
    }
    const {routeToQueriesMap} = updateRouteToQueryMap(sourceFile, routeQueries, {})
    expect(routeToQueriesMap).toEqual({
      '/:owner/:repo/issues/:number/tasks': ['3dca38ca6b50c0eb980488f5faaa478b', '111', '222'],
    })
  })

  it('Does nothing if registerReactAppFactory is not imported', () => {
    const source = `
      export * from './ssr'
      export * from './ssr-globals'
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )
    const routeQueries = {}
    const {routeToQueriesMap} = updateRouteToQueryMap(sourceFile, routeQueries, {})
    expect(routeToQueriesMap).toEqual({})
  })

  it('Does nothing if relayRoute is not imported', () => {
    const source = `
    import {OspoMetrics} from './routes/OspoMetrics'
    import {registerReactAppFactory} from '@github-ui/react-core/register-app'
    import {jsonRoute} from '@github-ui/react-core/json-route'

    registerReactAppFactory('orgs-insights', () => ({
      App,
      routes: [jsonRoute({path: '/orgs/:org/insights/org_metrics', Component: OspoMetrics})],
    }))
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )
    const routeQueries = {}
    const {routeToQueriesMap} = updateRouteToQueryMap(sourceFile, routeQueries, {})
    expect(routeToQueriesMap).toEqual({})
  })

  it('Fails if the import name is not part of the query map', () => {
    const source = `
    registerReactAppFactory('tasks-hierarchy', () => {
      return {
        App,
        routes: [
          relayRoute({
            path: '/:owner/:repo/issues/:number/tasks',
            queryConfigs: {
              taskListQuery: {
                concreteRequest: TASK_LIST_PAGE_QUERY,
                    variableMappers: routeParams => {
                  return {
                    owner: routeParams.pathParams['owner'],
                    repo: routeParams.pathParams['repo'],
                    number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
                  }
                },
              },
            },
          }),
        ],
      }
    })
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )

    const routeQueries = {}

    expect.assertions(1)
    expect(() => {
      updateRouteToQueryMap(sourceFile, routeQueries, {})
    }).toThrow('Could not find query TASK_LIST_PAGE_QUERY in routeQueries')
  })

  it('Gracefully handle the case where routes is a constant', () => {
    const source = `
      const routes = [
        relayRoute({
          path: '/:owner/:repo/issues/:number/tasks',
          queryConfigs: {
            taskListQuery: {
              concreteRequest: TASK_LIST_PAGE_QUERY,
              variableMappers: routeParams => {
                return {
                  owner: routeParams.pathParams['owner'],
                  repo: routeParams.pathParams['repo'],
                  number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
                }
              },
            },
          },
        }),
      ]

      registerReactAppFactory('tasks-hierarchy', () => {
        return {
          App,
          routes,
        }
      })
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )
    const routeQueries = {
      TASK_LIST_PAGE_QUERY: '3dca38ca6b50c0eb980488f5faaa478b',
    }
    expect(() => {
      updateRouteToQueryMap(sourceFile, routeQueries, {})
    }).toThrow(/Please assign the routes directly/)
  })

  it('Gracefully handle the case where routes is a function', () => {
    const source = `
      const getRoutes = () => {
        return [
          relayRoute({
            path: '/:owner/:repo/issues/:number/tasks',
            queryConfigs: {
              taskListQuery: {
                concreteRequest: TASK_LIST_PAGE_QUERY,
                variableMappers: routeParams => {
                  return {
                    owner: routeParams.pathParams['owner'],
                    repo: routeParams.pathParams['repo'],
                    number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
                  }
                },
              },
            },
          }),
        ]
      }

      registerReactAppFactory('tasks-hierarchy', () => {
        return {
          App,
          routes: getRoutes(),
        }
      })
    `
    const resourcePath = 'app/assets/modules/tasks-hierarchy/index.ts'
    const sourceFile = ts.createSourceFile(
      resourcePath, // file name
      source, // file content
      ts.ScriptTarget.Latest, // language version
      true, // set 'setParentNodes' option to true
    )
    const routeQueries = {
      TASK_LIST_PAGE_QUERY: '3dca38ca6b50c0eb980488f5faaa478b',
    }

    expect(() => {
      updateRouteToQueryMap(sourceFile, routeQueries, {})
    }).toThrow(/Please assign the routes directly/)
  })
})
