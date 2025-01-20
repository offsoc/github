import type {Comment, CommentingImplementation, Thread} from '@github-ui/conversations'
import type {DiffLine} from '@github-ui/diff-lines'
import {noop} from '@github-ui/noop'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useCallback, useMemo} from 'react'

import {useInlineComments} from '../contexts/InlineCommentsContext'
import type {CommitPayload} from '../types/commit-types'
import {type DeleteResult, type EditResult, type HideResult, type Result, useCommenting} from './use-commenting'
import {useFetchThread} from './use-fetch-commit-thread'

export function useDiffInlineCommenting(): CommentingImplementation {
  const payload = useRoutePayload<CommitPayload>()
  const {commit, commentInfo} = payload
  const fetchThread = useFetchThread({commit, repo: payload.repo, viewerCanReply: commentInfo.canComment})
  const {addComment, deleteComment, editComment, hideComment, unhideComment} = useCommenting()
  const {findInlineComment} = useInlineComments()

  const addThreadReply = useCallback(
    ({
      filePath,
      onCompleted,
      onError,
      text,
      thread,
    }: {
      commentsConnectionIds?: string[]
      filePath: string
      onCompleted?: (commentDatabaseId?: number) => void
      onError: (error: Error) => void
      text: string
      thread: Thread
      threadsConnectionId?: string
    }) => {
      const [path, position] = thread.id.split('::')

      if (!path || !position) {
        onError(new Error('Invalid threadId'))
        return
      }

      // eslint-disable-next-line github/no-then
      addComment(text, filePath, position).then((result: Result) => {
        if (result.comment) {
          onCompleted?.(result.comment.id)
        } else {
          onError(new Error('Failed to add comment'))
        }
      })
    },
    [addComment],
  )

  const addThread = useCallback(
    ({
      text,
      diffLine,
      filePath,
      onCompleted,
      onError,
    }: {
      text: string
      diffLine?: DiffLine
      filePath: string
      onCompleted?: (threadId: string, commentDatabaseId?: number) => void
      onError?: (error: Error) => void
    }) => {
      // commit comments require position but PRs does not
      // so we pass it into our build_file_diff_payload
      if (!diffLine) return
      if (!diffLine.position) return

      // eslint-disable-next-line github/no-then
      addComment(text, filePath, diffLine.position.toString()).then((result: Result) => {
        if (result.comment) {
          const commentId = result.comment.id
          const threadId = `${filePath}::${diffLine.position}` // TODO - get thread id from response

          // TODO - refresh diff lines to get new thread marker
          onCompleted?.(threadId, commentId)
        } else {
          onError?.(new Error('Failed to add comment'))
        }
      })
    },
    [addComment],
  )

  const editThreadComment = useCallback(
    ({
      comment,
      text,
      onCompleted,
      onError,
    }: {
      comment: Comment
      onCompleted?: () => void
      onError: (error: Error) => void
      text: string
    }) => {
      const existingComment = findInlineComment(comment.id)

      if (!existingComment) {
        onError(new Error('Comment not found'))
        return
      }

      const commitComment = {
        id: existingComment.id,
        bodyVersion: existingComment.bodyVersion,
      }

      // eslint-disable-next-line github/no-then
      editComment(text, commitComment).then((result: EditResult) => {
        if (result.updatedFields) {
          onCompleted?.()
        } else {
          onError(new Error('Failed to edit comment'))
        }
      })
    },
    [editComment, findInlineComment],
  )

  const deleteThreadComment = useCallback(
    ({
      commentId,
      onCompleted,
      onError,
    }: {
      commentConnectionId?: string
      commentId: string // relay id
      filePath: string
      onCompleted?: () => void
      onError?: (error: Error) => void
      threadCommentCount?: number
      threadId: string
      threadsConnectionId?: string
    }) => {
      // we are provided the relay id, but we need the database id
      // so we need to find the comment in the context first
      const existingComment = findInlineComment(commentId)

      if (!existingComment) {
        onError?.(new Error('Comment not found'))
        return
      }

      // eslint-disable-next-line github/no-then
      deleteComment(existingComment.id.toString()).then((result: DeleteResult) => {
        if (result === 'success') {
          onCompleted?.()
        } else if (result === 'error') {
          onError?.(new Error('Failed to delete comment'))
        } else if (result === 'canceled') {
          // do nothing
        }
      })
    },
    [deleteComment, findInlineComment],
  )

  const hideThreadComment = useCallback(
    ({
      commentId,
      reason,
      onCompleted,
      onError,
    }: {
      commentId: string
      reason: string
      onCompleted?: () => void
      onError: (error: Error) => void
    }) => {
      // we are provided the relay id, but we need the database id
      // so we need to find the comment in the context first
      const existingComment = findInlineComment(commentId)

      if (!existingComment) {
        onError?.(new Error('Comment not found'))
        return
      }

      // eslint-disable-next-line github/no-then
      hideComment(existingComment.id.toString(), reason).then((result: HideResult) => {
        if (result === 'success') {
          onCompleted?.()
        } else if (result === 'error') {
          onError(new Error('Failed to hide comment'))
        }
      })
    },
    [findInlineComment, hideComment],
  )

  const unhideThreadComment = useCallback(
    ({
      commentId,
      onCompleted,
      onError,
    }: {
      commentId: string
      onCompleted?: () => void
      onError: (error: Error) => void
    }) => {
      // we are provided the relay id, but we need the database id
      // so we need to find the comment in the context first
      const existingComment = findInlineComment(commentId)

      if (!existingComment) {
        onError?.(new Error('Comment not found'))
        return
      }

      // eslint-disable-next-line github/no-then
      unhideComment(existingComment.id.toString()).then((result: HideResult) => {
        if (result === 'success') {
          onCompleted?.()
        } else if (result === 'error') {
          onError(new Error('Failed to unhide comment'))
        }
      })
    },
    [findInlineComment, unhideComment],
  )

  return useMemo(
    () => ({
      batchingEnabled: false,
      commentSubjectType: 'commit',
      multilineEnabled: false,
      resolvingEnabled: false,
      suggestedChangesEnabled: false,
      lazyFetchReactionGroups: true,
      lazyFetchEditHistory: true,
      addThread,
      addThreadReply,
      deleteComment: deleteThreadComment,
      editComment: editThreadComment,
      pendingSuggestedChangesBatch: [],
      submitSuggestedChanges: noop,
      addSuggestedChangeToPendingBatch: noop,
      removeSuggestedChangeFromPendingBatch: noop,
      addFileLevelThread: noop,
      resolveThread: noop,
      unresolveThread: noop,
      hideComment: hideThreadComment,
      unhideComment: unhideThreadComment,
      fetchThread,
      commentBoxConfig: {
        pasteUrlsAsPlainText: false,
        useMonospaceFont: false,
      },
    }),
    [
      addThread,
      addThreadReply,
      deleteThreadComment,
      editThreadComment,
      fetchThread,
      hideThreadComment,
      unhideThreadComment,
    ],
  )
}
