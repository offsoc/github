import {GitHubAvatar} from '@github-ui/github-avatar'
import {graphql, readInlineData, useFragment} from 'react-relay'
import {Link} from '@primer/react'
import {userHovercardPath} from '@github-ui/paths'
import {AssigneeFragment} from '@github-ui/item-picker/AssigneePicker'
import type {AssigneePickerAssignee$key} from '@github-ui/item-picker/AssigneePicker.graphql'
import type {ParticipantFragment$key} from './__generated__/ParticipantFragment.graphql'

type ParticipantProps = {
  participant: ParticipantFragment$key
}

export function Participant({participant}: ParticipantProps) {
  const data = useFragment(
    graphql`
      fragment ParticipantFragment on User {
        ...AssigneePickerAssignee
      }
    `,
    participant,
  )
  // Using AssigneeFragment here since participants are converted to assignees in the assignee picker's update mutation
  // eslint-disable-next-line no-restricted-syntax
  const {login, avatarUrl} = readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, data)
  return (
    <Link href={`/${login}`}>
      <GitHubAvatar
        src={avatarUrl}
        size={20}
        alt={`@${login}`}
        data-hovercard-url={userHovercardPath({owner: login})}
        sx={{boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))'}}
      />
    </Link>
  )
}
