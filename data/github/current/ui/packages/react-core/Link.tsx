import {useContext, forwardRef, type ForwardedRef, type ReactElement} from 'react'
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
  resolvePath,
  matchRoutes,
} from 'react-router-dom'
import {AppContext} from './app-context'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {PREVENT_AUTOFOCUS_KEY} from './prevent-autofocus'

type PreventAutofocusProp = {preventAutofocus?: boolean}

export const Link = forwardRef(
  (
    {to, reloadDocument, preventAutofocus, ...props}: LinkProps & PreventAutofocusProp,
    ref: ForwardedRef<HTMLAnchorElement>,
  ): ReactElement => {
    const {routes} = useContext(AppContext)
    const pathname = resolvePath(to, ssrSafeLocation.pathname).pathname
    reloadDocument = reloadDocument ?? !matchRoutes(routes, pathname)
    return (
      <RouterLink
        to={to}
        {...props}
        state={
          preventAutofocus
            ? {
                [PREVENT_AUTOFOCUS_KEY]: true,
                ...props.state,
              }
            : props.state
        }
        reloadDocument={reloadDocument}
        ref={ref}
      />
    )
  },
)

Link.displayName = 'Link'

export const NavLink = forwardRef(function NavLink(
  {to, reloadDocument, preventAutofocus, ...props}: NavLinkProps & PreventAutofocusProp,
  ref: React.ForwardedRef<HTMLAnchorElement>,
): React.ReactElement {
  const {routes} = useContext(AppContext)
  const pathname = resolvePath(to, ssrSafeLocation.pathname).pathname
  reloadDocument = reloadDocument ?? !matchRoutes(routes, pathname)
  return (
    <RouterNavLink
      to={to}
      {...props}
      state={
        preventAutofocus
          ? {
              [PREVENT_AUTOFOCUS_KEY]: true,
              ...props.state,
            }
          : props.state
      }
      reloadDocument={reloadDocument}
      ref={ref}
    />
  )
})
