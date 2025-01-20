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
 * as well as methods for matching and generating paths
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
  function makeRoute<Path extends string, FullPath extends string>(path: Path): Route<Path, FullPath> {
    const fullPath = `${basePath}${path}` as FullPath
    const pathWithChildPaths = `${path}/*`
    const fullPathWithChildPaths = `${fullPath}/*`
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
      generatePath: args => {
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
      generateFullPath: args => {
        // @ts-expect-error `generatePath` accepts numbers as values, but the types aren't friendly
        return generatePath(fullPath, args)
      },

      /**
       * A function that matches a pathname to the given path
       */
      matchPath: pathToMatch => {
        return matchPath(path, pathToMatch)
      },

      /**
       * Matches a full pathname, inclusive of
       * the base path
       */
      matchFullPath: pathToMatch => {
        return matchPath(fullPath, pathToMatch)
      },

      /**
       * Matches this route, but also any children of it
       */
      matchPathOrChildPaths: pathToMatch => {
        return matchPath(pathWithChildPaths, pathToMatch)
      },

      /**
       * Matches a full pathname, inclusive of
       * the base path, and any children of it
       */
      matchFullPathOrChildPaths: pathToMatch => {
        return matchPath(fullPathWithChildPaths, pathToMatch)
      },

      /**
       * Generate a child route, given additional
       * path segments, that inherit the path segments
       * from their parents
       */
      childRoute: childPath => {
        const childBasePath = `${path}${childPath}`
        return makeRoute(childBasePath)
      },
    } as const
  }
  return {baseRoute: makeRoute('')}
}
