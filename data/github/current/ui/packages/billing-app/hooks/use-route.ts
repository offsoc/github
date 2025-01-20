import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {findRouteBestMatchByPath, matchBaseRouteByPath} from '../routes'

export default function useRoute<Path extends string, FullPath extends string>(
  // The base route to match against
  route: Route<Path, FullPath>,
  // Additional URL params to use when generating the path
  args?: {[K in keyof ExtractRouteParams<FullPath>]: number | string},
  // Additional query params to append to the generated path
  reqParams?: Record<string, string>,
) {
  const pathname = ssrSafeLocation.pathname
  const params = useParams()
  const getPath = (): string => {
    let newPath =
      matchBaseRouteByPath(pathname)
        ?.childRoute(route.fullPath)
        .generateFullPath({...params, ...args}) ?? ''

    const matchingRoute = findRouteBestMatchByPath(newPath)

    // If we don't find a matching registered route, use the original provided
    if (!matchingRoute) newPath = route.fullPath

    if (reqParams) {
      const queryParamString = new URLSearchParams(reqParams).toString()
      newPath = `${newPath}?${queryParamString}`
    }

    return newPath
  }

  const [path, setPath] = useState<string>(getPath())

  useEffect(() => {
    setPath(getPath())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, route, params, args, reqParams])

  return {path}
}
