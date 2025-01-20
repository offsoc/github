import {useMemo} from 'react'
import {Octicon} from '@primer/react'
import {GitPullRequestClosedIcon, GitPullRequestDraftIcon, GitPullRequestIcon} from '@primer/octicons-react'
import type {LinkedPullRequest} from '../types/linked-pull-request'

export type LinkedPullRequestIconProps = {
  linkedPullRequest: LinkedPullRequest
}

export function getLinkedPullRequestIconColor(linkedPullRequest: LinkedPullRequest): string {
  if (linkedPullRequest.state === 'open') {
    return linkedPullRequest.draft ? 'fg.muted' : 'open.fg'
  }

  if (linkedPullRequest.mergedAt) {
    return 'done.fg'
  }

  if (linkedPullRequest.closedAt) {
    return 'closed.fg'
  }

  // Not sure which state the PR is in, just return the default color
  return 'fg.muted'
}

export function getLinkedPullRequestIcon(linkedPullRequest: LinkedPullRequest) {
  if (linkedPullRequest.mergedAt) {
    return GitPullRequestIcon
  }

  if (linkedPullRequest.closedAt) {
    return GitPullRequestClosedIcon
  }

  if (linkedPullRequest.draft) {
    return GitPullRequestDraftIcon
  }

  return GitPullRequestIcon
}

export function LinkedPullRequestIcon({linkedPullRequest}: LinkedPullRequestIconProps) {
  const iconColor = useMemo(() => getLinkedPullRequestIconColor(linkedPullRequest), [linkedPullRequest])

  const icon = useMemo(() => getLinkedPullRequestIcon(linkedPullRequest), [linkedPullRequest])

  return <Octicon icon={icon} color={iconColor} />
}
