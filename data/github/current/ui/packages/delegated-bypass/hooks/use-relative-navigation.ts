import {useCallback, useRef} from 'react'
import {useLocation, resolvePath as reactRouterResolvePath} from 'react-router-dom'
import {useNavigate} from '@github-ui/use-navigate'

export const useRelativeNavigation = () => {
  const {pathname, search} = useLocation()
  const params = useRef(new URLSearchParams(search))
  const reactRouterNavigate = useNavigate()

  const navigate = useCallback(
    (pathPartial: string, _search?: string, clearExistingParams = true, replace = false) => {
      if (clearExistingParams) {
        params.current = new URLSearchParams()
      }
      if (_search) {
        const additionalParams = new URLSearchParams(_search)
        for (const [key, value] of additionalParams) {
          if (value === '') {
            params.current.delete(key)
          } else {
            params.current.set(key, value)
          }
        }
      }
      return reactRouterNavigate(
        reactRouterResolvePath({pathname: pathPartial, search: params.current.toString()}, pathname),
        {
          replace,
        },
      )
    },
    [reactRouterNavigate, pathname, params],
  )

  const resolvePath = useCallback(
    (pathPartial: string) => reactRouterResolvePath({pathname: pathPartial}, pathname).pathname,
    [pathname],
  )

  return {
    pathname,
    search,
    params: params.current,
    navigate,
    resolvePath,
  }
}
