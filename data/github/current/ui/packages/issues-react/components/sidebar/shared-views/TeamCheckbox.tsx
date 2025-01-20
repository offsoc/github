import {GitHubAvatar} from '@github-ui/github-avatar'
import {ActionList} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {TeamCheckboxItem$key} from './__generated__/TeamCheckboxItem.graphql'

type TeamCheckboxProps = {
  teamCheckboxItem: TeamCheckboxItem$key
  checked: boolean
  onSelect: (id: string) => void
}

export const TeamCheckbox = ({teamCheckboxItem, onSelect, checked = false}: TeamCheckboxProps) => {
  const {
    id,
    name,
    avatarUrl,
    organization: {name: orgName},
  } = useFragment(
    graphql`
      fragment TeamCheckboxItem on Team {
        id
        name
        avatarUrl
        organization {
          name
        }
      }
    `,
    teamCheckboxItem,
  )
  return (
    <ActionList.Item key={id} selected={checked} onSelect={() => onSelect(id)}>
      <ActionList.LeadingVisual>
        <GitHubAvatar square src={avatarUrl!} />
      </ActionList.LeadingVisual>
      {orgName}/{name}
    </ActionList.Item>
  )
}
