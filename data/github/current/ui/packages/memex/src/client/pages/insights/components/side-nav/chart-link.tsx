import {testIdProps} from '@github-ui/test-id-props'
import {Box, NavList} from '@primer/react'
import {memo} from 'react'

import {PotentiallyDirty} from '../../../../components/potentially-dirty'
import {NavLinkActionListItem} from '../../../../components/react-router/action-list-nav-link-item'

export const ChartLink = memo<
  React.ComponentProps<typeof NavList.Item> & {
    to: string
    isDirty: boolean
    isActive: boolean
    children: string
    trailingVisual?: JSX.Element | null
    leadingVisual?: JSX.Element | null
  }
>(function ChartLink({to, isActive, children, isDirty, leadingVisual = null, trailingVisual = null, ...props}) {
  return (
    <NavLinkActionListItem to={to} isActive={isActive} end {...props}>
      {/* eslint-disable-next-line primer-react/direct-slot-children */}
      {leadingVisual ? <NavList.LeadingVisual>{leadingVisual}</NavList.LeadingVisual> : null}

      <Box sx={{position: 'relative', display: 'flex', alignItems: 'center', gap: 2}}>
        {children}
        {!isActive && isDirty ? (
          <PotentiallyDirty
            isDirty
            hideDirtyState={false}
            sx={{position: 'static'}}
            {...testIdProps('my-chart-navigation-item-dirty')}
          />
        ) : null}
      </Box>

      {/* eslint-disable-next-line primer-react/direct-slot-children */}
      {trailingVisual ? <NavList.TrailingVisual>{trailingVisual}</NavList.TrailingVisual> : null}
    </NavLinkActionListItem>
  )
})
