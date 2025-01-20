export const VALUES = {
  // display-safe fallback for a null GraphQL User
  // preferred method is to pass ghostUser in by app payload
  // avatarURL is environment dependent
  ghostUser: {
    displayName: 'Ghost',
    login: 'ghost',
    avatarUrl: 'https://avatars.githubusercontent.com/ghost',
    path: '/ghost',
    url: '/ghost',
  },
  localStorageKeys: {
    issueComment: (prefix: string, issueId: string, commentId: string) =>
      `${prefix}-i${issueId}-c${commentId}.view-issue-comment`,
    issueNewComment: (prefix: string, issueId: string) => `${prefix}-i${issueId}.view-issue-comment-new`,
  },
}
