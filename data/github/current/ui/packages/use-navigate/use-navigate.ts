import React, {startTransition} from 'react'
import {
  createSearchParams,
  matchRoutes,
  resolvePath,
  useLocation,
  useNavigate as useReactRouterNavigate,
  useSearchParams as useReactRouterSearchParams,
  type NavigateOptions,
  type To,
  type URLSearchParamsInit,
} from 'react-router-dom'

import isHashNavigation from '@github-ui/is-hash-navigation'
import {AppContext} from '@github-ui/react-core/app-context'
import {startSoftNav} from '@github-ui/soft-nav/state'
import {PREVENT_AUTOFOCUS_KEY} from '@github-ui/react-core/prevent-autofocus'

export interface NavigateOptionsWithPreventAutofocus extends NavigateOptions {
  preventAutofocus?: boolean
}

export const useNavigate = (): ((to: To, options?: NavigateOptionsWithPreventAutofocus) => void) => {
  const {routes, history} = React.useContext(AppContext)
  const reactRouterNavigate = useReactRouterNavigate()
  return React.useCallback(
    (to, navigateOptions = {}) => {
      const pathname = resolvePath(to).pathname
      const isExternalToApp = !matchRoutes(routes, pathname)

      if (isExternalToApp) {
        const href = history.createHref(to)
        ;(async () => {
          const {softNavigate: turboSoftNavigate} = await import('@github-ui/soft-navigate')
          turboSoftNavigate(href)
        })()
      } else {
        if (!isHashNavigation(location.href, to.toString())) {
          startSoftNav('react')
        }
        const {preventAutofocus, ...options} = navigateOptions
        startTransition(() => {
          reactRouterNavigate(
            to,
            preventAutofocus
              ? {
                  ...options,
                  state: {
                    [PREVENT_AUTOFOCUS_KEY]: true,
                    ...options.state,
                  },
                }
              : options,
          )
          const {turbo, ...state} = window.history.state
          window.history.replaceState({...state, skipTurbo: true}, '', location.href)
        })
      }
    },
    [history, reactRouterNavigate, routes],
  )
}

/**
 * An implementation of `useSearchParams` that mirrors `react-router-dom`'s `useSearchParams` hook
 * but utilizes `@github-ui/useNavigate` instead of `react-router` `useNavigate` to handle updates.
 */
export const useSearchParams = () => {
  const [searchParams] = useReactRouterSearchParams()
  const navigate = useNavigate()
  const {pathname} = useLocation()

  const setSearchParams = React.useCallback<
    (
      nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit),
      navigateOpts?: NavigateOptionsWithPreventAutofocus,
    ) => void
  >(
    (nextInit, navigateOptions = {}) => {
      const newSearchParams = createSearchParams(typeof nextInit === 'function' ? nextInit(searchParams) : nextInit)
      navigate(
        {
          pathname,
          search: newSearchParams.toString(),
        },
        navigateOptions,
      )
    },
    [searchParams, navigate, pathname],
  )

  return [searchParams, setSearchParams] as const
}
