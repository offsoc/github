import {ActionList, Octicon} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {ParentIssueFragment$data, ParentIssueFragment$key} from './__generated__/ParentIssueFragment.graphql'
import {SubIssuesSummary} from './SubIssuesSummary'
import type React from 'react'
import {IssueStateIcons, type SourceIconType} from '@github-ui/timeline-items/Icons'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useParentIssueSubscription} from '../../ParentIssueSubscription'

const ParentIssueFragment = graphql`
  fragment ParentIssueFragment on Issue {
    id
    title
    url
    number
    repository {
      nameWithOwner
    }
    state
    stateReason
    ...SubIssuesSummary
  }
`

type ParentIssueProps = {
  onLinkClick?: (event: MouseEvent) => void
}

type ParentIssueInternalProps = Omit<ParentIssueProps, 'queryRef'> & {
  issueKey: ParentIssueFragment$key
}

export function ParentIssue({issueKey, onLinkClick}: ParentIssueInternalProps) {
  const data = useFragment(ParentIssueFragment, issueKey)

  useParentIssueSubscription(data.id)

  return (
    <ActionList.LinkItem
      href={data.url}
      target="_blank"
      onClick={
        onLinkClick
          ? (event: React.MouseEvent<HTMLElement>) => {
              onLinkClick(event.nativeEvent)
            }
          : undefined
      }
    >
      <ActionList.LeadingVisual>{getIcon(data.state, data.stateReason)}</ActionList.LeadingVisual>
      <ActionList.TrailingVisual>
        <SubIssuesSummary issue={data} />
      </ActionList.TrailingVisual>
      {data.title}
      <ActionList.Description variant="block">
        {data.repository.nameWithOwner}#{data.number}
      </ActionList.Description>
    </ActionList.LinkItem>
  )
}

export const getIcon = (
  state: ParentIssueFragment$data['state'],
  stateReason: ParentIssueFragment$data['stateReason'],
  sx: BetterSystemStyleObject = {},
): JSX.Element | null => {
  let icon: SourceIconType | undefined
  if (state === 'OPEN') {
    icon = IssueStateIcons.OPEN
  } else if (stateReason === 'COMPLETED') {
    icon = IssueStateIcons.COMPLETED
  } else if (stateReason === 'NOT_PLANNED') {
    icon = IssueStateIcons.NOT_PLANNED
  }
  if (!icon) {
    return null
  }
  return <Octicon icon={icon.icon} sx={{...sx, color: icon.color}} />
}
