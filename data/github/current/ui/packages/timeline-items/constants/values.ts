export const VALUES = {
  ghostUserLogin: 'ghost',
  issueStateReasonStrings: {
    COMPLETED: 'completed',
    NOT_PLANNED: 'not planned',
    REOPENED: 'reopened',
  },
  lockedReasonStrings: {
    OFF_TOPIC: 'off topic',
    RESOLVED: 'resolved',
    SPAM: 'spam',
    TOO_HEATED: 'too heated',
  },
  issueStateReason: {
    COMPLETED: 'COMPLETED',
    NOT_PLANNED: 'NOT_PLANNED',
    REOPENED: 'REOPENED',
  },
  stateChangeQuery: {
    COMPLETED: 'is:issue state:closed archived:false reason:"completed"',
    NOT_PLANNED: 'is:issue state:closed archived:false reason:"not planned"',
    REOPENED: 'reopened',
  },
  labelQuery: (owner: string, repo: string, name: string) => `repo:${owner}/${repo} state:open label:"${name}"`,
  timeline: {
    majorEventTypes: [
      'IssueComment',
      'ClosedEvent',
      'ReopenedEvent',
      'CrossReferencedEvent',
      'ReferencedEvent',
      'PullRequestReview',
    ],
    borderedMajorEventTypes: ['IssueComment'],
    badgeSize: 18,
    pageSize: 150,
    maxPreloadCount: 150,
  },
  commitBadgeHelpUrl:
    'https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits',
  closingViaCommitMessageUrl: 'https://docs.github.com/articles/closing-issues-via-commit-messages',
}
