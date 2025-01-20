export const CLASS_NAMES = {
  issueComment: 'react-issue-comment',
  commentsContainer: 'react-comments-container',
  markdownBody: 'markdown-body',
  issueBody: 'react-issue-body',
}

export const IDS = {
  issueCommentComposer: 'react-issue-comment-composer',
}

export function withIDSelector(id: string) {
  return `#${id}`
}

export function withClassSelector(className: string) {
  return `.${className}`
}
