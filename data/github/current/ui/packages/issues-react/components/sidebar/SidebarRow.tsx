import {Link} from '@github-ui/react-core/link'
import {NavList, Octicon, Tooltip} from '@primer/react'
import type React from 'react'

import {urlSuffix} from '../../utils/urls'

type SidebarRowProps = {
  icon: React.ElementType
  title: string
  id: string
  path: string
  tooltip: string
  onClick?: () => void
}

export function SidebarRow({icon, title, id, path, tooltip, onClick}: SidebarRowProps) {
  const suffix = urlSuffix()

  return (
    <NavList.Item as={Link} aria-current={suffix === id ? 'page' : undefined} to={path} onClick={onClick}>
      <NavList.LeadingVisual>
        <Octicon icon={icon} />
      </NavList.LeadingVisual>
      <Tooltip aria-label={tooltip}>{title}</Tooltip>
    </NavList.Item>
  )
}
