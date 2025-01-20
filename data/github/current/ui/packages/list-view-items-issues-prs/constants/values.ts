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

export const VALUES = {
  issueHierarchyItemChildrenFetchPageSize: 25,
  issueItemLabelFetchPageSize: 10,
  maxListSize: 100,
  ghostUserLogin: 'ghost',
  ghostUserAvatarUrl: '/ghost.png',
}

export const ICONS_VALUES = {
  issueIcons: {
    OPEN: {
      color: 'open.fg',
      icon: IssueOpenedIcon,
      description: 'Status: Open.',
    },
    CLOSED: {
      color: 'done.fg',
      icon: IssueClosedIcon,
      description: 'Status: Closed (completed).',
    },
    NOT_PLANNED: {
      color: 'fg.muted',
      icon: SkipIcon,
      description: 'Status: Not planned (skipped).',
    },
  },
  pullRequestIcons: {
    MERGED: {
      color: 'done.fg',
      icon: GitMergeIcon,
      description: 'Status: Merged (completed).',
    },
    IN_MERGE_QUEUE: {
      color: 'attention.fg',
      icon: GitMergeQueueIcon,
      description: 'Status: In merge queue.',
    },
    OPEN: {
      color: 'open.fg',
      icon: GitPullRequestIcon,
      description: 'Status: Open (in progress).',
    },
    CLOSED: {
      color: 'closed.fg',
      icon: GitPullRequestClosedIcon,
      description: 'Status: Closed (abandoned).',
    },
    DRAFT: {
      color: 'fg.muted',
      icon: GitPullRequestDraftIcon,
      description: 'Status: Draft (not ready).',
    },
  },
}
