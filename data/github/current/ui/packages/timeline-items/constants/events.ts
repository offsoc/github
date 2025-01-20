export const EVENTS = {
  event: 'event',
  issueComment: 'issuecomment',
  pullRequestComment: 'discussion_r',
  pullRequestReview: 'pullrequestreview',
}

export const PULL_REQUEST_EVENTS = [
  `#${EVENTS.event}`,
  `#${EVENTS.issueComment}`,
  `#${EVENTS.pullRequestComment}`,
  `#${EVENTS.pullRequestReview}`,
]

export const ISSUE_EVENTS = [`#${EVENTS.issueComment}`, `#${EVENTS.event}`]
