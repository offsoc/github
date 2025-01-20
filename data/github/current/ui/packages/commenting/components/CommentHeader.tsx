import {
  MarkdownEditHistoryViewer,
  MarkdownEditHistoryViewerQueryComponent,
} from '@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer'
import type {SxProp} from '@primer/react'

import {ActivityHeader} from './ActivityHeader'
import {CommentActions, type CommentActionsProps} from './CommentActions'

export type CommentSubjectTypes = 'pull request' | 'issue' | 'commit'

export type CommentHeaderProps = Omit<CommentActionsProps, 'editHistoryComponent'> & {
  avatarUrl: string
  userAvatar?: JSX.Element
  additionalHeaderMessage?: JSX.Element
  viewerDidAuthor?: boolean
  /**
   * The login of the author of the subject of the comment.
   *
   * e.g. the login of the author of the issue, pull request, commit the comment is on.
   */
  commentSubjectAuthorLogin?: string
  hideActions?: boolean
  isReply?: boolean
  commentAuthorType?: string
  /**
   * The type of the subject that the comment is associated to.
   * Used as display text in the subject author tooltip.
   */
  commentSubjectType?: CommentSubjectTypes
  headingProps?: {
    as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
  lazyFetchEditHistory?: boolean
  id?: string
} & SxProp

export function CommentHeader({hideActions, lazyFetchEditHistory = false, ...props}: CommentHeaderProps) {
  let editHistoryComponent = null

  if (lazyFetchEditHistory) {
    editHistoryComponent = <MarkdownEditHistoryViewerQueryComponent id={props.comment.id} />
  } else {
    editHistoryComponent = <MarkdownEditHistoryViewer editHistory={props.comment} />
  }

  return (
    <ActivityHeader
      {...props}
      actions={hideActions ? undefined : <CommentActions {...props} editHistoryComponent={editHistoryComponent} />}
    />
  )
}
