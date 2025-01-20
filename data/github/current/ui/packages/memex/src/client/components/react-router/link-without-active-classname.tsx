import {type ComponentProps, forwardRef} from 'react'

import {NavLink} from '../../router'

export const NavLinkWithoutActiveClassName = forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof NavLink> & {activeClassName?: string}
>(function NavLinkWithoutActiveClassName({activeClassName, ...props}, forwardedRef) {
  return <NavLink {...props} ref={forwardedRef} />
})
