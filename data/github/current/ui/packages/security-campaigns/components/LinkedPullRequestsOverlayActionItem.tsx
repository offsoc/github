import {ActionList, RelativeTime} from '@primer/react'
import type {LinkedPullRequest} from '../types/linked-pull-request'
import {LinkedPullRequestIcon} from './LinkedPullRequestIcon'
import {useMemo} from 'react'

export type LinkedPullRequestsOverlayActionItemProps = {
  linkedPullRequest: LinkedPullRequest
}

export function LinkedPullRequestsOverlayActionItem({linkedPullRequest}: LinkedPullRequestsOverlayActionItemProps) {
  const lastActionText = useMemo(() => {
    if (linkedPullRequest.mergedAt) {
      return (
        <>
          merged <RelativeTime datetime={linkedPullRequest.mergedAt} prefix="" />
        </>
      )
    }

    if (linkedPullRequest.closedAt) {
      return (
        <>
          closed <RelativeTime datetime={linkedPullRequest.closedAt} prefix="" />
        </>
      )
    }

    return (
      <>
        opened <RelativeTime datetime={linkedPullRequest.createdAt} prefix="" />
      </>
    )
  }, [linkedPullRequest])

  return (
    <ActionList.LinkItem href={linkedPullRequest.path}>
      <ActionList.LeadingVisual>
        <LinkedPullRequestIcon linkedPullRequest={linkedPullRequest} />
      </ActionList.LeadingVisual>
      {linkedPullRequest.title}
      <ActionList.Description variant="block">
        #{linkedPullRequest.number} {lastActionText}
      </ActionList.Description>
    </ActionList.LinkItem>
  )
}
