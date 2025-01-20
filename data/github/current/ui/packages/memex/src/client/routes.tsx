import {useEffect} from 'react'
import {generatePath, matchPath} from 'react-router-dom'

const ORIGIN_404 = () => `${window.location.origin}/404`
/**
 * When we don't have a routing match in the application, redirect
 * to the external GitHub 404 page
 */
export function Origin404Redirect() {
  useEffect(() => {
    window.location.href = ORIGIN_404()
  }, [])
  return null
}

/**
 * Returns an initial route based on a path
 * as well as  methods for matching and generating paths
 * as well as generating sub routes.
 */
export function createBaseRoute<BasePath extends string>(basePath: BasePath) {
  /**
   * Given a path (e.g. `/foo/:bar/baz`), returns an object
   * with that property as a path, as well as a typed
   * method to generate paths from that path
   * and its parameter parts (interpolated), as well
   * as a helper for matching that path to a given pathname/location string
   */
  function makeRoute<Path extends string>(path: Path) {
    const fullPath = `${basePath}${path}` as const
    const pathWithChildPaths = `${path}/*` as const
    const fullPathWithChildPaths = `${fullPath}/*` as const
    return {
      /**
       * The path
       */
      path,

      /**
       * The given path with a trailing wildcard route,
       * to match children
       */
      pathWithChildPaths,

      /**
       * The full path of the route, inclusive of the
       * base path as well as all parent segments
       */
      fullPath,

      /**
       * The full path, with a trailing wildcard
       * for matching
       */
      fullPathWithChildPaths,
      /**
       * A function that generates a path from the path and its params
       */
      generatePath: (args: ExtractRouteParams<Path>) => {
        // @ts-expect-error `generatePath` accepts numbers as values, but the types aren't friendly
        return generatePath(path, args)
      },

      /**
       * Generate a path _with_ the base name
       *
       * In generally, we only need this for links
       * in the dev environment, and potentially
       * for links to _other_ projects.
       *
       * React router Links don't need a full path, because
       * we scoped all of the links to be based on the
       * basepath
       */
      generateFullPath: (args: {
        [K in keyof ExtractRouteParams<typeof fullPath>]: number | string
      }) => {
        // @ts-expect-error `generatePath` accepts numbers as values, but the types aren't friendly
        return generatePath(fullPath, args)
      },

      /**
       * A function that matches a pathname to the given path
       */
      matchPath: (pathToMatch: string) => {
        return matchPath(path, pathToMatch)
      },

      /**
       * Matches a full pathname, inclusive of
       * the base path
       */
      matchFullPath: (pathToMatch: string) => {
        return matchPath(fullPath, pathToMatch)
      },

      /**
       * Matches this route, but also any children of it
       */
      matchPathOrChildPaths: (pathToMatch: string) => {
        return matchPath(pathWithChildPaths, pathToMatch)
      },

      /**
       * Matches a full pathname, inclusive of
       * the base path, and any children of it
       */
      matchFullPathOrChildPaths: (pathToMatch: string) => {
        return matchPath(fullPathWithChildPaths, pathToMatch)
      },

      /**
       * Generate a child route, given additional
       * path segments, that inherit the path segments
       * from their parents
       */
      childRoute: <ChildPath extends string>(childPath: ChildPath) => {
        return makeRoute(`${path}${childPath}`)
      },
    } as const
  }
  return {baseRoute: makeRoute('')}
}

const {baseRoute} = createBaseRoute('')

/**
 * The base route for all project routes. All other routes should be children of this one
 */
export const PROJECT_ROUTE = baseRoute.childRoute('/:ownerType/:ownerIdentifier/projects/:projectNumber')
/**
 * Project view routes
 */
export const PROJECT_VIEW_ROUTE = PROJECT_ROUTE.childRoute('/views/:viewNumber')

/**
 * Workflows routes
 */
export const PROJECT_WORKFLOWS_ROUTE = PROJECT_ROUTE.childRoute('/workflows')
export const PROJECT_WORKFLOW_CLIENT_ID_ROUTE = PROJECT_WORKFLOWS_ROUTE.childRoute('/:workflowClientId')

/**
 * Settings routes
 */
export const PROJECT_SETTINGS_ROUTE = PROJECT_ROUTE.childRoute('/settings')
export const PROJECT_SETTINGS_FIELD_ROUTE = PROJECT_SETTINGS_ROUTE.childRoute('/fields/:fieldId')
export const PROJECT_SETTINGS_ACCESS_ROUTE = PROJECT_SETTINGS_ROUTE.childRoute('/access')

/**
 * Insights routes
 */
export const PROJECT_INSIGHTS_ROUTE = PROJECT_ROUTE.childRoute('/insights')
export const PROJECT_INSIGHTS_NUMBER_ROUTE = PROJECT_INSIGHTS_ROUTE.childRoute('/:insightNumber')

/**
 * Archive routes
 */
export const PROJECT_ARCHIVE_ROUTE = PROJECT_ROUTE.childRoute('/archive')

/**
 * When creating a new route, make sure to add it to the map of routes below
 */
export const routesMap = {
  PROJECT_ROUTE,
  PROJECT_VIEW_ROUTE,
  PROJECT_WORKFLOWS_ROUTE,
  PROJECT_WORKFLOW_CLIENT_ID_ROUTE,
  PROJECT_SETTINGS_ROUTE,
  PROJECT_SETTINGS_FIELD_ROUTE,
  PROJECT_INSIGHTS_ROUTE,
  PROJECT_INSIGHTS_NUMBER_ROUTE,
  PROJECT_SETTINGS_ACCESS_ROUTE,
  PROJECT_ARCHIVE_ROUTE,
} as const

/**
 * Reverse query a route to find its template string based on a given real path
 * @param pathToMatch A "client side" path, i.e.: "/projects/1"
 * @returns An object with the match information or null if no match was found
 */
export const findRouteBestMatchByPath = (pathToMatch: string) =>
  Object.values(routesMap).find(route => route.matchPath(pathToMatch)) ?? null
