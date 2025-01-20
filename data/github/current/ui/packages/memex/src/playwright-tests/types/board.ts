export const MissingStatusColumn = {
  Id: 'no_vertical_group',
  Label: 'No Status',
} as const

export const BacklogColumn = {
  Id: 'backlog',
  Label: 'Backlog',
} as const

export const InProgressColumn = {
  Id: 'in_progress',
  Label: 'In Progress',
} as const

export const ReadyColumn = {
  Id: 'ready',
  Label: 'Ready',
} as const

export const DoneColumn = {
  Id: 'done',
  Label: 'Done',
} as const

export const ItemType = {
  DraftIssue: 'DraftIssue',
  Issue: 'Issue',
  PullRequest: 'PullRequest',
  RedactedItem: 'RedactedItem',
} as const
export type ItemType = ObjectValues<typeof ItemType>
