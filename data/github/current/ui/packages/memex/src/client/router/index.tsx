import {forwardRef, useCallback} from 'react'
import {
  // eslint-disable-next-line no-restricted-imports
  Link as ReactRouterLink,
  type LinkProps,
  // eslint-disable-next-line no-restricted-imports
  Navigate as ReactRouterNavigate,
  type NavigateOptions,
  type NavigateProps,
  // eslint-disable-next-line no-restricted-imports
  NavLink as ReactRouterNavLink,
  type NavLinkProps,
  type RelativeRoutingType,
  type To,
  // eslint-disable-next-line no-restricted-imports
  useLinkClickHandler as useReactRouterLinkClickHandler,
  // eslint-disable-next-line no-restricted-imports
  useNavigate as useReactRouterNavigate,
  // eslint-disable-next-line no-restricted-imports
  useSearchParams as useReactRouterSearchParams,
} from 'react-router-dom'

function stateWithDefaults(state?: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {skipTurbo: true, ...state}
}
/**
 * Wraps react-router-dom's useNavigate hook to add a skipTurbo state property
 */
export const useNavigate = () => {
  const navigate = useReactRouterNavigate()

  return useCallback(
    (to: To, opts?: NavigateOptions): void => {
      return navigate(to, {
        ...opts,
        state: stateWithDefaults(opts?.state),
      })
    },
    [navigate],
  )
}

/**
 * Wraps react-router-dom's Link component to add a skipTurbo state property
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return <ReactRouterLink data-turbo="false" {...props} state={stateWithDefaults(props.state)} ref={ref} />
})

/**
 * Wraps react-router-dom's NavLink component to add a skipTurbo state property
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(props, ref) {
  return <ReactRouterNavLink data-turbo="false" {...props} state={stateWithDefaults(props.state)} ref={ref} />
})

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useReactRouterSearchParams()

  const setUrlSearchParams: typeof setSearchParams = useCallback(
    (nextParams, opts) => {
      setSearchParams(nextParams, {
        ...opts,
        state: stateWithDefaults(opts?.state),
      })
    },
    [setSearchParams],
  )

  return [searchParams, setUrlSearchParams] as const
}

export function Navigate(props: NavigateProps) {
  return <ReactRouterNavigate {...props} state={stateWithDefaults(props.state)} />
}

export function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  to: To,
  opts?: {
    target?: React.HTMLAttributeAnchorTarget
    replace?: boolean
    state?: any
    preventScrollReset?: boolean
    relative?: RelativeRoutingType
  },
): (event: React.MouseEvent<E, MouseEvent>) => void {
  const options = {
    ...opts,
    state: stateWithDefaults(opts?.state),
  }
  return useReactRouterLinkClickHandler<E>(to, options)
}
