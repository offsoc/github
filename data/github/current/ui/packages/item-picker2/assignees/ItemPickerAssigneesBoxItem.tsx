import {Box, NavList} from '@primer/react'
import {graphql, useFragment} from 'react-relay'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath} from '@github-ui/paths'

import type {ItemPickerAssigneesBoxItem_Fragment$key} from './__generated__/ItemPickerAssigneesBoxItem_Fragment.graphql'

/**
 * Renders a single assignee in the assignees box.
 */
export function ItemPickerAssigneesBoxItem(props: {assigneeKey: ItemPickerAssigneesBoxItem_Fragment$key}) {
  const assignee = useFragment(
    graphql`
      fragment ItemPickerAssigneesBoxItem_Fragment on User {
        login
        avatarUrl(size: 64)
      }
    `,
    props.assigneeKey,
  )

  return (
    <NavList.Item
      href={`/${assignee.login}`}
      target="_blank"
      data-hovercard-url={userHovercardPath({owner: assignee.login})}
    >
      <NavList.LeadingVisual>
        <GitHubAvatar
          src={assignee.avatarUrl}
          alt={`@${assignee.login}`}
          sx={{boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))'}}
        />
      </NavList.LeadingVisual>
      <Box sx={{mx: 0, width: '100%', fontSize: 0, fontWeight: '600'}}>{assignee.login}</Box>
    </NavList.Item>
  )
}
