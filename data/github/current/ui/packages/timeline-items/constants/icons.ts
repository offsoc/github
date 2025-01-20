import type {Icon} from '@primer/octicons-react'
import {
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon,
} from '@primer/octicons-react'

export type SourceIconType = {color: string; icon: Icon; label?: string}

export const PullRequestStateIcons = {
  MERGED: {
    color: 'done.fg',
    icon: GitMergeIcon,
    label: 'Merged',
  },
  IN_MERGE_QUEUE: {
    color: 'attention.fg',
    icon: GitMergeQueueIcon,
    label: 'In merge queue',
  },
  OPEN: {
    color: 'open.fg',
    icon: GitPullRequestIcon,
    label: 'Open',
  },
  CLOSED: {
    color: 'closed.fg',
    icon: GitPullRequestClosedIcon,
    label: 'Closed',
  },
  DRAFT: {
    color: 'fg.muted',
    icon: GitPullRequestDraftIcon,
    label: 'Draft',
  },
} as const satisfies Record<string, SourceIconType>

export const IssueStateIcons = {
  OPEN: {
    color: 'open.fg',
    icon: IssueOpenedIcon,
    label: 'Open',
  },
  COMPLETED: {
    color: 'done.fg',
    icon: IssueClosedIcon,
    label: 'Completed',
  },
  NOT_PLANNED: {
    color: 'fg.muted',
    icon: SkipIcon,
    label: 'Not planned',
  },
} as const satisfies Record<string, SourceIconType>
