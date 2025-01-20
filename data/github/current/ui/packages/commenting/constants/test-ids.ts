export const TEST_IDS = {
  avatarLink: 'avatar-link',
  commentAuthorAssociation: 'comment-author-association',
  commentSubjectAuthor: 'comment-subject-author',
  sponsorLabel: 'sponsor-label',
  commentHeader: 'comment-header',
  commentHeaderLeftSideItems: 'comment-header-left-side-items',
  commentHeaderRightSideItems: 'comment-header-right-side-items',
  commentHeaderHamburger: 'comment-header-hamburger',
  commentHeaderHamburgerOpen: 'comment-header-hamburger-open',
  commentMenuRefComment: 'comment-menu-ref-comment',
  commentViewerOuterBox: (id: string | undefined) => {
    return id ? `comment-viewer-outer-box-${id}` : 'comment-viewer-outer-box'
  },
  commentComposer: 'comment-composer',
  markdownBody: 'markdown-body',
  commentBox: (postFix = '') => `markdown-editor-${postFix}`,
  readonlyCommentBox: (postFix = '') => `readonly-markdown-editor-${postFix}`,
  commentSkeleton: 'comment-skeleton',
}
