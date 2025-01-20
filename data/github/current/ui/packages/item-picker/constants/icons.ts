import {
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  type Icon,
} from '@primer/octicons-react'

type SourceIconType = {color: string; icon: Icon}

export const PullRequestStateIcons = {
  MERGED: {
    color: 'done.fg',
    icon: GitMergeIcon,
  },
  IN_MERGE_QUEUE: {
    color: 'attention.fg',
    icon: GitMergeQueueIcon,
  },
  OPEN: {
    color: 'open.fg',
    icon: GitPullRequestIcon,
  },
  CLOSED: {
    color: 'closed.fg',
    icon: GitPullRequestClosedIcon,
  },
  DRAFT: {
    color: 'fg.muted',
    icon: GitPullRequestDraftIcon,
  },
} as const satisfies Record<string, SourceIconType>
