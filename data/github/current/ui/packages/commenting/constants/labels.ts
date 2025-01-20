export const LABELS = {
  canNotCommentOnIssue: 'You do not have permissions to comment on this issue.',
  confirmations: {
    deleteCommentTitle: 'Delete comment',
    deleteCommentContent: "Are you sure you'd like to delete this comment?",
    deleteCommentConfirmButtonContent: 'Delete',
  },
  hiddenComment: 'Hidden comment',
  hiddenCommentWithReason: 'Hidden as',
  issueLockedToCollaborators: 'This conversation has been locked and limited to collaborators.',
  repoArchived: 'This repository has been archived.',
  sentViaEmail: 'Sent via email',
  commentAuthor: 'Author',
  sponsorBadge: 'Sponsor',
  newComment: 'new Comment',
  newCommentPlaceholder: 'Use Markdown to format your comment',
  commentSubjectAuthoer: (viewerDidAuthor: boolean, subjectType: string) =>
    `${viewerDidAuthor ? 'You are the' : 'This user is the'} author of this ${subjectType}`,
  sponsor: (owner: string, since: string) => `${owner}'s sponsor since ${since}`,
  noDescriptionProvided: 'No description provided.',
  staleCommentErrorPrefix: 'GraphQL error: STALE_DATA',
}
