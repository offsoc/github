import {
  CheckCircleFillIcon,
  CheckCircleIcon,
  ClockIcon,
  DotFillIcon,
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  NoEntryFillIcon,
  RepoCloneIcon,
  RepoForkedIcon,
  RepoIcon,
  RepoLockedIcon,
  SkipIcon,
  XCircleFillIcon,
  XIcon,
} from '@primer/octicons-react'
import type {LabelProps} from '@primer/react'

export const ListItemPrimaryAreaOptions = [
  'Issues',
  'Pull Requests',
  'Deployments',
  'Repositories',
  'Usernames',
] as const
export const ListItemStatusAreaOptions = ['Issues', 'Pull Requests', 'Deployments', 'Repositories', 'Avatars'] as const
export const ListViewHeaderAreaOptions = [
  'isSelectable',
  'isCollapsible',
  'Title',
  'SectionFilterLink',
  'CompletionPill',
  'ActionBar',
] as const
export const ListItemDescriptionAreaOptions = [
  'Combo',
  'Branch name',
  'Relative time',
  'Review state and checks',
] as const

export type ListItemPrimaryAreaOption = (typeof ListItemPrimaryAreaOptions)[number]
export type ListItemStatusAreaOption = (typeof ListItemStatusAreaOptions)[number]
export type ListViewHeaderAreaOption = (typeof ListViewHeaderAreaOptions)[number]
export type ListItemDescriptionAreaOption = (typeof ListItemDescriptionAreaOptions)[number]

export type Label = {
  name: string
  variant: LabelProps['variant']
}

export const titles: {[key in ListItemPrimaryAreaOption]: string[]} = {
  Issues: [
    'Updates to velocity of the ship and alien movements to directly support the new engine',
    'Add a new "Alien" type to the game',
    'Support for multiple players',
    'Player ship can shoot laser beams',
    'We should add a new type of alien that moves faster than the others and a new type of alien that moves faster than the others. Both should be worth more points.',
  ],
  'Pull Requests': [
    'Pull request branched off of a branch',
    'Spike implementation',
    'This title has a a really long overly descriptive title that is probably too long to fit in the space provided which is just a testing best practice at this point',
    'New pull request',
  ],
  Deployments: [
    'Merge pull request #287313 from github/simon-engledew/fix-286650',
    'Fix test and address linting issues',
    'This is a really long title that keeps going and going and going and going more or less to the point where the author really should have picked something a little shorter',
    'Fix flakey tests',
    'Test Branch',
  ],
  Usernames: ['monalisa', 'primer', 'monalisa', 'monalisa'],
  Repositories: ['test-repo', 'github', 'maximum'],
}

export const labels: Label[] = [
  {name: 'A11y Audit 2023', variant: 'attention'},
  {name: 'accessibility', variant: 'secondary'},
  {name: 'backlog', variant: 'primary'},
  {name: 'design-reviewable', variant: 'success'},
  {name: 'fr-skip', variant: 'accent'},
  {name: 'HCL', variant: 'severe'},
  {name: 'HCL-GitHub Actions-September 2023', variant: 'danger'},
  {name: 'project:actions', variant: 'done'},
  {name: 'service:github/actions', variant: 'sponsors'},
  {name: 'Severity-3', variant: 'primary'},
  {name: 'WCAG 1.3.1 Info and Relationships', variant: 'secondary'},
  {name: 'Win11-Chrome', variant: 'accent'},
]

export const branches = ['github/github#123', 'monalisa/smile#4', 'github/issues#421', 'github/viewscreen#140938']
export const relativeTimes = [
  'a few seconds ago',
  'a minute ago',
  'an hour ago',
  'a day ago',
  'a week ago',
  'a month ago',
  'a year ago',
]
export const reviewStates = [
  {
    icon: CheckCircleFillIcon,
    color: 'success.fg',
    description: 'Approved',
  },
  {
    icon: XCircleFillIcon,
    color: 'danger.fg',
    description: 'Changes requested',
  },
  {
    icon: NoEntryFillIcon,
    color: 'attention.fg',
    description: 'Review required',
  },
]
export const checkStates = [
  {
    icon: CheckCircleIcon,
    color: 'checks.donutSuccess',
    count: '127/128',
  },
  {
    icon: XIcon,
    color: 'checks.donutError',
    count: '50/128',
  },
  {
    icon: DotFillIcon,
    color: 'checks.donutPending',
    count: '101/128',
  },
]

const IssueIcons = [
  {
    icon: IssueOpenedIcon,
    description: 'Status: Open.',
    color: 'open.fg',
  },
  {
    color: 'done.fg',
    icon: IssueClosedIcon,
    description: 'Status: Closed (completed).',
  },
  {
    color: 'fg.muted',
    icon: SkipIcon,
    description: 'Status: Not planned (skipped).',
  },
]

const pullRequestIcons = [
  {
    color: 'done.fg',
    icon: GitMergeIcon,
    description: 'Status: Merged (completed).',
  },
  {
    color: 'attention.fg',
    icon: GitMergeQueueIcon,
    description: 'Status: In merge queue.',
  },
  {
    color: 'open.fg',
    icon: GitPullRequestIcon,
    description: 'Status: Open (in progress).',
  },
  {
    color: 'closed.fg',
    icon: GitPullRequestClosedIcon,
    description: 'Status: Closed (abandoned).',
  },
  {
    color: 'fg.muted',
    icon: GitPullRequestDraftIcon,
    description: 'Status: Draft (not ready).',
  },
]

const DeployMessage = {
  Complete: 'Status: Deployed (completed).',
  Failure: 'Status: Failed to deploy (completed).',
  Idle: 'Status: Ready to deploy (idle).',
}

const deploymentIcons = [
  {
    color: 'success.fg',
    icon: CheckCircleFillIcon,
    description: DeployMessage.Complete,
  },
  {
    color: 'success.fg',
    icon: CheckCircleFillIcon,
    description: DeployMessage.Complete,
  },
  {
    color: 'fg.subtle',
    icon: CheckCircleIcon,
    description: DeployMessage.Complete,
  },
  {
    color: 'danger.fg',
    icon: XCircleFillIcon,
    description: DeployMessage.Failure,
  },
  {
    color: 'danger.fg',
    icon: XCircleFillIcon,
    description: DeployMessage.Failure,
  },
  {
    color: 'attention.fg',
    icon: ClockIcon,
    description: DeployMessage.Idle,
  },
  {
    color: 'fg.subtle',
    icon: SkipIcon,
    description: DeployMessage.Failure,
  },
  {
    color: 'fg.subtle',
    icon: SkipIcon,
    description: DeployMessage.Complete,
  },
  {
    color: 'attention.fg',
    icon: DotFillIcon,
    description: DeployMessage.Idle,
  },
  {
    color: 'attention.fg',
    icon: DotFillIcon,
    description: DeployMessage.Idle,
  },
]

const repositoryIcons = [
  {
    color: 'fg.muted',
    icon: RepoForkedIcon,
    description: 'Forked repository',
  },
  {
    color: 'fg.muted',
    icon: RepoCloneIcon,
    decription: 'Cloned repository',
  },
  {
    color: 'fg.muted',
    icon: RepoLockedIcon,
    description: 'Locked repository',
  },
  {
    color: 'fg.muted',
    icon: RepoIcon,
    description: 'Repository',
  },
]

export const iconMap = {
  Issues: IssueIcons,
  'Pull Requests': pullRequestIcons,
  Deployments: deploymentIcons,
  Repositories: repositoryIcons,
}
