import type React from 'react'

import {Box} from '@primer/react'
import {Bold} from './Ui'
import type {SeatType} from '../../types'

export const SeatHovercardLink = (
  props: React.PropsWithChildren<{
    assignable_type: SeatType
    owner: string
    login: string
    className?: string
    testId?: string
    color?: string
  }>,
) => {
  const {login, assignable_type, owner, className, testId, children, color} = props

  const href = () => {
    switch (assignable_type) {
      case 'User':
        return `/orgs/${owner}/people/${login}`
      case 'Team':
        return `/orgs/${owner}/teams/${login}`
      case 'OrganizationInvitation':
        return `/${login}`
      case 'EnterpriseTeam':
        return `//enterprises/${owner}/external_group_members/${login}`
      default:
        return ''
    }
  }

  const hoverUrl = () => {
    switch (assignable_type) {
      case 'User':
        return `/users/${login}/hovercard`
      case 'Team':
        return `/orgs/${owner}/teams/${login}/hovercard`
      case 'OrganizationInvitation':
        return `/users/${login}/hovercard`
      default:
        return ''
    }
  }

  return (
    <Box
      as="a"
      sx={{color: color || 'fg.default', whiteSpace: 'nowrap'}}
      className={className}
      data-hovercard-type="user"
      data-hovercard-url={hoverUrl()}
      data-octo-click="hovercard-link-click"
      data-octo-dimensions="link_type:self"
      data-hovercard-z-index-override="1000"
      data-testid={testId}
      href={href()}
      aria-label={login}
    >
      <Bold>{children}</Bold>
    </Box>
  )
}
