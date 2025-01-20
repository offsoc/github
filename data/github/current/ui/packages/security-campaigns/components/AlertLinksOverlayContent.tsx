import {ActionList} from '@primer/react'
import type {LinkedBranch} from '../types/linked-branch'
import type {LinkedPullRequest} from '../types/linked-pull-request'
import {LinkedBranchOverlayActionItem} from './LinkedBranchOverlayActionItem'
import {LinkedPullRequestsOverlayActionItem} from './LinkedPullRequestsOverlayActionItem'

export type AlertLinksOverlayContentProps = {
  linkedPullRequests: LinkedPullRequest[]
  linkedBranches: LinkedBranch[]
}

export function AlertLinksOverlayContent({linkedPullRequests, linkedBranches}: AlertLinksOverlayContentProps) {
  return (
    <ActionList>
      {linkedPullRequests.map(pullRequest => (
        <LinkedPullRequestsOverlayActionItem key={pullRequest.number} linkedPullRequest={pullRequest} />
      ))}
      {linkedBranches.map(branch => (
        <LinkedBranchOverlayActionItem key={branch.name} linkedBranch={branch} />
      ))}
    </ActionList>
  )
}
