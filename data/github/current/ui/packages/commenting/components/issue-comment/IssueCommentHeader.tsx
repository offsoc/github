/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useConfirm} from '@primer/react'
import {useCallback} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {ERRORS} from '../../constants/errors'
import {LABELS} from '../../constants/labels'
import {commitDeleteIssueCommentMutation} from '../../mutations/delete-issue-comment-mutation'
import {minimizeCommentMutation} from '../../mutations/minimize-comment-mutation'
import {unminimizeCommentMutation} from '../../mutations/unminimize-comment-mutation'
import {CommentHeader} from '../CommentHeader'
import type {IssueCommentHeader$key} from './__generated__/IssueCommentHeader.graphql'

export type IssueCommentHeaderProps = {
  anchorBaseUrl?: string
  comment: IssueCommentHeader$key
  commentAuthorLogin: string
  editComment: () => void
  onReplySelect: (quotedText?: string) => void
  isMinimized?: boolean
  onMinimize?: (value: boolean) => void
  navigate: (url: string) => void
  avatarUrl: string
  commentRef?: React.RefObject<HTMLDivElement>
  relayConnectionIds?: string[]
  commentSubjectAuthorLogin?: string
  hideActions?: boolean
  commentAuthorType?: string
}

export function IssueCommentHeader({
  anchorBaseUrl,
  comment,
  commentAuthorLogin,
  editComment,
  onReplySelect,
  isMinimized = false,
  onMinimize: onMinimized,
  navigate,
  avatarUrl,
  commentRef,
  relayConnectionIds,
  commentSubjectAuthorLogin,
  hideActions = false,
  commentAuthorType,
}: IssueCommentHeaderProps) {
  const commentData = useFragment(
    graphql`
      fragment IssueCommentHeader on IssueComment {
        id
        databaseId
        url
        createdAt
        body
        authorAssociation
        viewerCanUpdate
        viewerCanDelete
        viewerCanMinimize
        viewerCanReport
        viewerCanReportToMaintainer
        viewerCanBlockFromOrg
        viewerCanUnblockFromOrg
        isHidden: isMinimized
        minimizedReason
        pendingMinimizeReason
        pendingBlock
        pendingUnblock
        createdViaEmail
        viewerDidAuthor
        authorToRepoOwnerSponsorship {
          createdAt
          isActive
        }
        author {
          id
          login
        }
        repository {
          id
          name
          owner {
            id
            login
            url
          }
          isPrivate
        }
        issue {
          number
        }
        ...MarkdownEditHistoryViewer_comment
      }
    `,
    comment,
  )

  const environment = useRelayEnvironment()
  const confirm = useConfirm()
  const {addToast} = useToastContext()

  const hideComment = useCallback(
    async (reason: 'SPAM' | 'ABUSE' | 'OFF_TOPIC' | 'OUTDATED' | 'DUPLICATE' | 'RESOLVED') => {
      minimizeCommentMutation({
        environment,
        input: {id: commentData.id, reason},
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: 'Failed to hide comment',
          })
        },
      })
    },
    [addToast, environment, commentData.id],
  )

  const unhideComment = useCallback(async () => {
    unminimizeCommentMutation({
      environment,
      input: {id: commentData.id},
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to unhide comment',
        })
      },
    })
  }, [addToast, environment, commentData.id])

  const deleteComment = useCallback(async () => {
    const performDelete = await confirm({
      title: LABELS.confirmations.deleteCommentTitle,
      content: LABELS.confirmations.deleteCommentContent,
      confirmButtonContent: LABELS.confirmations.deleteCommentConfirmButtonContent,
      confirmButtonType: 'danger',
    })

    if (!performDelete) return

    const connections = relayConnectionIds ?? []

    commitDeleteIssueCommentMutation({
      environment,
      connectionIds: connections,
      input: {id: commentData.id},
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.couldNotDeleteComment,
        })
      },
    })
  }, [confirm, commentData.id, relayConnectionIds, environment, addToast])

  const url = anchorBaseUrl ? `${anchorBaseUrl}#issuecomment-${commentData.databaseId}` : commentData.url

  return (
    <CommentHeader
      comment={{
        ...commentData,
        referenceText: `#${commentData.issue.number}`,
        url,
        viewerCanSeeMinimizeButton: true,
        viewerCanSeeUnminimizeButton: true,
      }}
      editComment={editComment}
      onReplySelect={onReplySelect}
      isMinimized={isMinimized}
      onMinimize={onMinimized}
      commentAuthorLogin={commentAuthorLogin}
      navigate={navigate}
      avatarUrl={avatarUrl}
      hideComment={hideComment}
      unhideComment={unhideComment}
      deleteComment={deleteComment}
      commentRef={commentRef}
      viewerDidAuthor={commentData.viewerDidAuthor}
      commentSubjectAuthorLogin={commentSubjectAuthorLogin}
      hideActions={hideActions}
      commentAuthorType={commentAuthorType}
      id={`issuecomment-${commentData.databaseId}`}
    />
  )
}
