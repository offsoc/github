import {type ActionListLinkItemProps, NavList} from '@primer/react'
import type {ComponentProps} from 'react'
import {useMatch, useResolvedPath} from 'react-router-dom'

import {NavLinkWithActiveClassName} from './nav-link-with-active-class-name'

export function NavLinkActionListItem({
  to,
  children,
  isActive,
  ...props
}: ActionListLinkItemProps & ComponentProps<typeof NavLinkWithActiveClassName>) {
  const resolved = useResolvedPath(to)
  const isCurrent = useMatch({path: resolved.pathname, end: true})
  return (
    <NavList.Item
      aria-current={isActive || isCurrent ? 'page' : false}
      as={NavLinkWithActiveClassName}
      {...props}
      to={to}
    >
      {children}
    </NavList.Item>
  )
}
