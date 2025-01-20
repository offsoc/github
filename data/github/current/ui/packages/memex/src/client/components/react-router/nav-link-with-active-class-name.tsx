import {forwardRef} from 'react'
import type {NavLinkProps} from 'react-router-dom'

import {NavLink} from '../../router'

interface NavLinkWithActiveClassNameProps extends Omit<NavLinkProps, 'className'> {
  className?: string
  isActive?: boolean
}

export const NavLinkWithActiveClassName = forwardRef<HTMLAnchorElement, NavLinkWithActiveClassNameProps>(
  function NavLinkWithActiveClassName({isActive: isActiveProps, className, ...restProps}, ref) {
    return (
      <NavLink
        {...restProps}
        ref={ref}
        className={({isActive}) => {
          return isActive || isActiveProps ? `${className} selected`.trim() : className ?? ''
        }}
      />
    )
  },
)
