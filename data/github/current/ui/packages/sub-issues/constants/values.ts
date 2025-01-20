import {IssueClosedIcon, IssueOpenedIcon, SkipIcon} from '@primer/octicons-react'

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
}

export const FEEDBACK_URLS = {
  employeeUrl: 'https://github.com/github/sub-issues/discussions/447',
  publicUrl: 'https://github.com/orgs/community/discussions/131957',
}
