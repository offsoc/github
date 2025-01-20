export const ItemType = {
  DraftIssue: 'DraftIssue',
  Issue: 'Issue',
  PullRequest: 'PullRequest',
  RedactedItem: 'RedactedItem',
} as const
export type ItemType = ObjectValues<typeof ItemType>
