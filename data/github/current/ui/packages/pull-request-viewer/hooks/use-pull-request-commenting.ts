import type {CommentingAppPayload} from '@github-ui/commenting/Types'
import type {Comment, CommentingImplementation, SuggestedChange, Thread} from '@github-ui/conversations'
import type {DiffLine, LineRange} from '@github-ui/diff-lines'
import {isContextDiffLine} from '@github-ui/diff-lines/line-helpers'
import type {GraphQLError} from '@github-ui/fetch-graphql'
import {noop} from '@github-ui/noop'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useCallback, useMemo} from 'react'
import {readInlineData, useRelayEnvironment} from 'react-relay'

import {usePendingSuggestedChangesBatchContext} from '../contexts/PendingSuggestedChangesBatchContext'
import {usePullRequestContext} from '../contexts/PullRequestContext'
import {useSelectedRefContext} from '../contexts/SelectedRefContext'
import addPullRequestReviewThreadMutation from '../mutations/add-pull-request-review-thread-mutation'
import addPullRequestThreadReplyMutation from '../mutations/add-pull-request-thread-reply'
import applySuggestedChangesMutation from '../mutations/apply-suggested-changes-mutation'
import deletePullRequestReviewCommentMutation from '../mutations/delete-pull-request-comment-mutation'
import resolvePullRequestThreadMutation from '../mutations/resolve-pull-request-thread-mutation'
import unresolvePullRequestThreadMutation from '../mutations/unresolve-pull-request-thread-mutation'
import updatePullRequestReviewComment from '../mutations/update-pull-request-review-comment-mutation'
import type {useFetchThread_PullRequestReviewComment$key} from './__generated__/useFetchThread_PullRequestReviewComment.graphql'
import {PullRequestCommentFragment, useFetchThread} from './use-fetch-thread'

function isGraphQLError(object: unknown): object is GraphQLError {
  if (typeof object !== 'object' || object === null) return false

  // test the properties on the object
  const error = object as GraphQLError
  return typeof error.type === 'string' && typeof error.message === 'string'
}

function tryGetErrorDetails(error: Error): {type?: string; friendlyMessage?: string} {
  const cause = error.cause
  if (Array.isArray(cause) && isGraphQLError(cause[0])) {
    const firstCause = cause[0]
    return {
      type: firstCause.type,
      friendlyMessage: firstCause.message,
    }
  }

  return {}
}

export function useSubmitSuggestedChanges() {
  const environment = useRelayEnvironment()
  const {pullRequestId, headRefOid} = usePullRequestContext()
  const {clearSuggestedChangesBatch} = usePendingSuggestedChangesBatchContext()
  return useCallback(
    ({
      commitMessage,
      suggestedChanges,
      onCompleted,
      onError,
    }: {
      commitMessage: string
      suggestedChanges: SuggestedChange[]
      onCompleted?: () => void
      onError?: (error: Error, type?: string, friendlyMessage?: string) => void
    }) => {
      const changes = suggestedChanges.map(suggestedChange => ({
        commentId: suggestedChange.commentId,
        suggestion: suggestedChange.suggestion,
        path: suggestedChange.path,
      }))

      applySuggestedChangesMutation({
        environment,
        input: {
          pullRequestId,
          currentOID: headRefOid,
          changes,
          message: commitMessage,
        },
        onCompleted: () => {
          // TODO: refresh PullRequest.comparison to show the new changes (e.g. the new commit applied, resolved convos, new diff info, etc..)
          onCompleted?.()
          clearSuggestedChangesBatch()

          location.reload()
        },
        onError: e => {
          const {type, friendlyMessage} = tryGetErrorDetails(e)
          onError?.(e, type, friendlyMessage)
        },
      })
    },
    [clearSuggestedChangesBatch, environment, headRefOid, pullRequestId],
  )
}

/**
 * Construct a set of functions that allow for various commenting actions on a pull request's diff(s).
 */
export function usePullRequestCommenting(): CommentingImplementation {
  const environment = useRelayEnvironment()
  const {pullRequestId} = usePullRequestContext()
  const {addSuggestedChangeToBatch, pendingSuggestedChangesBatch, removeSuggestedChangeFromBatch} =
    usePendingSuggestedChangesBatchContext()
  const {startOid, endOid} = useSelectedRefContext()
  const fetchThread = useFetchThread()

  const submitSuggestedChanges = useSubmitSuggestedChanges()

  const addThread = useCallback(
    ({
      text,
      diffLine,
      filePath,
      isLeftSide,
      onCompleted,
      onError,
      selectedDiffRowRange,
      submitBatch,
      threadsConnectionId,
    }: {
      text: string
      diffLine?: DiffLine
      filePath: string
      isLeftSide?: boolean
      onCompleted?: (threadId: string, commentDatabaseId?: number) => void
      onError?: (error: Error) => void
      selectedDiffRowRange?: LineRange
      submitBatch?: boolean
      threadsConnectionId?: string
    }) => {
      if (!diffLine) return
      const isMultiLineComment: boolean =
        selectedDiffRowRange && selectedDiffRowRange.startLineNumber !== selectedDiffRowRange.endLineNumber
          ? true
          : false
      let line: number = diffLine.blobLineNumber
      let side: 'LEFT' | 'RIGHT' = isLeftSide && !isContextDiffLine(diffLine) ? 'LEFT' : 'RIGHT'
      let startLine: number | undefined
      let startSide: 'LEFT' | 'RIGHT' | undefined

      if (selectedDiffRowRange && isMultiLineComment) {
        side = selectedDiffRowRange.endOrientation === 'left' ? 'LEFT' : 'RIGHT'
        startSide = selectedDiffRowRange.startOrientation === 'left' ? 'LEFT' : 'RIGHT'
        line = selectedDiffRowRange.endLineNumber
        startLine = selectedDiffRowRange.startLineNumber
      }

      const startCommitOid = startOid
      const endCommitOid = endOid
      const diffRange = startCommitOid && endCommitOid ? {startCommitOid, endCommitOid} : undefined

      addPullRequestReviewThreadMutation({
        environment,
        threadsConnectionId,
        input: {
          diffRange,
          subjectType: 'LINE',
          body: text,
          line,
          path: filePath,
          side,
          startLine,
          startSide,
          submitReview: submitBatch,
          pullRequestId,
        },
        onCompleted: response => {
          const thread = response.addPullRequestReviewThread?.pullRequestThread
          const commentNode = thread?.comments.edges?.[0]?.node
          let commentId: number | undefined | null
          if (commentNode) {
            const commentData = readInlineData<useFetchThread_PullRequestReviewComment$key>(
              PullRequestCommentFragment,
              commentNode,
            )
            commentId = commentData.databaseId
          }

          onCompleted?.(thread?.id ?? '', commentId ?? undefined)
        },
        onError: () => {
          onError?.(new Error())
        },
        pullRequestId,
      })
    },
    [endOid, environment, pullRequestId, startOid],
  )

  const addThreadReply = useCallback(
    ({
      commentsConnectionIds = [],
      filePath,
      onCompleted,
      onError,
      submitBatch,
      text,
      thread,
      threadsConnectionId,
    }: {
      commentsConnectionIds?: string[]
      filePath: string
      onCompleted?: (commentDatabaseId?: number) => void
      onError: (error: Error) => void
      submitBatch?: boolean
      text: string
      thread: Thread
      threadsConnectionId?: string
    }) => {
      addPullRequestThreadReplyMutation({
        commentsConnectionIds,
        environment,
        input: {
          pullRequestThreadId: thread.id,
          body: text,
          submitReview: submitBatch,
        },
        onCompleted: response => {
          const commentNode = response.addPullRequestThreadReply?.comment
          let commentId: number | undefined | null
          if (commentNode) {
            const commentData = readInlineData<useFetchThread_PullRequestReviewComment$key>(
              PullRequestCommentFragment,
              commentNode,
            )
            commentId = commentData.databaseId
          }

          onCompleted?.(commentId ?? undefined)
        },
        onError,
        pullRequestId,
        threadsConnectionId,
        filePath,
      })
    },
    [environment, pullRequestId],
  )

  const addFileLevelThread = useCallback(
    ({
      onCompleted,
      onError,
      text,
      threadsConnectionId,
      filePath,
      submitBatch,
    }: {
      onCompleted?: (threadId: string, commentDatabaseId?: number) => void
      onError?: (error: Error) => void
      text: string
      threadsConnectionId?: string
      filePath: string
      submitBatch?: boolean
    }) => {
      addPullRequestReviewThreadMutation({
        environment,
        threadsConnectionId,
        input: {
          subjectType: 'FILE',
          body: text,
          path: filePath,
          submitReview: submitBatch,
          pullRequestId,
        },
        onCompleted: response => {
          const thread = response.addPullRequestReviewThread?.pullRequestThread
          const commentNode = thread?.comments.edges?.[0]?.node
          let commentId: number | undefined | null
          if (commentNode) {
            const commentData = readInlineData<useFetchThread_PullRequestReviewComment$key>(
              PullRequestCommentFragment,
              commentNode,
            )
            commentId = commentData.databaseId
          }

          onCompleted?.(thread?.id ?? '', commentId ?? undefined)
        },
        onError,
        pullRequestId,
      })
    },
    [environment, pullRequestId],
  )

  const deleteComment = useCallback(
    ({
      commentConnectionId,
      commentId,
      filePath,
      onCompleted,
      onError,
      threadCommentCount,
      threadId,
      threadsConnectionId,
    }: {
      commentConnectionId?: string
      commentId: string
      filePath: string
      onCompleted?: () => void
      onError?: (error: Error) => void
      threadCommentCount?: number
      threadId: string
      threadsConnectionId?: string
    }) => {
      deletePullRequestReviewCommentMutation({
        connectionId: commentConnectionId,
        environment,
        filePath,
        input: {id: commentId},
        onCompleted,
        onError,
        threadCommentCount,
        threadId,
        threadsConnectionId,
        pullRequestId,
      })
    },
    [environment, pullRequestId],
  )

  const editComment = useCallback(
    ({
      comment,
      onCompleted,
      onError,
      text,
    }: {
      comment: Comment
      onCompleted?: () => void
      onError?: (error: Error) => void
      text: string
    }) => {
      updatePullRequestReviewComment({
        environment,
        input: {body: text, pullRequestReviewCommentId: comment.id},
        onCompleted,
        onError,
      })
    },
    [environment],
  )

  const resolveThread = useCallback(
    ({onCompleted, onError, thread}: {onCompleted?: () => void; onError?: (error: Error) => void; thread: Thread}) => {
      resolvePullRequestThreadMutation({
        environment,
        input: {threadId: thread.id},
        onCompleted,
        onError,
        pullRequestId,
      })
    },
    [environment, pullRequestId],
  )

  const unresolveThread = useCallback(
    ({onCompleted, onError, thread}: {onCompleted?: () => void; onError?: (error: Error) => void; thread: Thread}) => {
      unresolvePullRequestThreadMutation({
        environment,
        input: {threadId: thread.id},
        onCompleted,
        onError,
        pullRequestId,
      })
    },
    [environment, pullRequestId],
  )

  const appPayload = useAppPayload<CommentingAppPayload>()
  const pasteUrlsAsPlainText = appPayload?.paste_url_link_as_plain_text || false
  const useMonospaceFont = appPayload?.current_user_settings?.use_monospace_font || false

  return useMemo(
    () => ({
      batchingEnabled: true,
      multilineEnabled: true,
      resolvingEnabled: true,
      suggestedChangesEnabled: true,
      lazyFetchReactionGroups: false,
      lazyFetchEditHistory: false,
      commentSubjectType: 'pull request',
      pendingSuggestedChangesBatch,
      addSuggestedChangeToPendingBatch: addSuggestedChangeToBatch,
      removeSuggestedChangeFromPendingBatch: removeSuggestedChangeFromBatch,
      addThread,
      addThreadReply,
      addFileLevelThread,
      deleteComment,
      editComment,
      fetchThread,
      resolveThread,
      unresolveThread,
      hideComment: noop,
      unhideComment: noop,
      commentBoxConfig: {
        pasteUrlsAsPlainText,
        useMonospaceFont,
      },
      submitSuggestedChanges,
    }),
    [
      addFileLevelThread,
      addSuggestedChangeToBatch,
      addThread,
      addThreadReply,
      deleteComment,
      editComment,
      fetchThread,
      pasteUrlsAsPlainText,
      pendingSuggestedChangesBatch,
      removeSuggestedChangeFromBatch,
      resolveThread,
      submitSuggestedChanges,
      unresolveThread,
      useMonospaceFont,
    ],
  )
}
