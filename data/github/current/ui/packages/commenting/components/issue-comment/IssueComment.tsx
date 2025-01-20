import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {noop} from '@github-ui/noop'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import type React from 'react'
import {useCallback, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {VALUES} from '../../constants/values'
import type {IssueComment_issueComment$key} from './__generated__/IssueComment_issueComment.graphql'
import {IssueCommentEditor} from './IssueCommentEditor'
import {IssueCommentViewer} from './IssueCommentViewer'

export type IssueCommentProps = {
  anchorBaseUrl?: string
  comment: IssueComment_issueComment$key
  onLinkClick?: (event: MouseEvent) => void
  onChange?: () => void
  onEditCancel?: () => void
  onReply?: (quotedComment: string) => void
  onSave?: () => void
  commentBoxConfig?: CommentBoxConfig
  refAttribute?: React.RefObject<HTMLDivElement>
  highlightedCommentId?: string
  relayConnectionIds?: string[]
  navigate: (url: string) => void
  commentSubjectAuthorLogin?: string
}

export const IssueCommentGraphqlQuery = graphql`
  query IssueCommentQuery($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        ...IssueCommentComposer
      }
    }
  }
`

export function IssueComment({
  anchorBaseUrl,
  comment,
  navigate,
  onLinkClick,
  onChange = noop,
  onEditCancel = noop,
  onReply = noop,
  onSave = noop,
  commentBoxConfig,
  refAttribute,
  highlightedCommentId,
  relayConnectionIds,
  commentSubjectAuthorLogin,
}: IssueCommentProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const data = useFragment(
    graphql`
      fragment IssueComment_issueComment on IssueComment {
        ...IssueCommentViewerCommentRow
        ...IssueCommentViewerReactable

        ...IssueCommentEditor_repository
        ...IssueCommentEditorBodyFragment
        issue {
          id
        }
        id
      }
    `,
    comment,
  )

  const [presavedComment, setPresavedComment] = useSessionStorage<string>(
    VALUES.localStorageKeys.issueComment('issuecomment', data.issue.id, data.id),
    '',
  )

  const commentSaved = useCallback(() => {
    setIsEditing(false)
    onSave()
    setPresavedComment(undefined)
  }, [onSave, setPresavedComment])

  const onCancel = () => {
    setIsEditing(false)
    setPresavedComment(undefined)
    onEditCancel()
  }

  const onCommentChange = useCallback(
    (value: string) => {
      setPresavedComment(value)
      onChange()
    },
    [onChange, setPresavedComment],
  )

  return (
    <>
      {isEditing || isSubmitting ? (
        <IssueCommentEditor
          setIsSubmitting={setIsSubmitting}
          isSubmitting={isSubmitting}
          cancelEdit={onCancel}
          onSave={commentSaved}
          comment={data}
          repo={data}
          initialValue={presavedComment}
          onChange={onCommentChange}
          commentBoxConfig={commentBoxConfig}
        />
      ) : (
        <IssueCommentViewer
          anchorBaseUrl={anchorBaseUrl}
          comment={data}
          reactable={data}
          setIsEditing={() => setIsEditing(true)}
          onReply={onReply}
          onLinkClick={onLinkClick}
          refAttribute={refAttribute}
          navigate={navigate}
          highlightedCommentId={highlightedCommentId}
          relayConnectionIds={relayConnectionIds}
          commentSubjectAuthorLogin={commentSubjectAuthorLogin}
        />
      )}
    </>
  )
}
