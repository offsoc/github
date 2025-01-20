import {CommentBoxButton, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {CommentHeader} from '@github-ui/commenting/CommentHeader'
import {VALUES} from '@github-ui/commenting/Values'
import {noop} from '@github-ui/noop'
import {ReactionViewer, ReactionViewerQueryComponent} from '@github-ui/reaction-viewer/ReactionViewer'
import {ReactionViewerLoading} from '@github-ui/reaction-viewer/ReactionViewerLoading'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box} from '@primer/react'
import {Suspense, useCallback, useEffect, useRef, useState} from 'react'

import {anchorComment} from '../helpers'
import {usePersistedDiffCommentData} from '../hooks/use-persisted-comment-data'
import type {
  ApplySuggestedChangesValidationData,
  Comment,
  CommentAuthor,
  CommentingImplementation,
  Subject,
  SuggestedChangesConfiguration,
  ViewerData,
} from '../types'
import {validateSuggestedChange} from '../util/validate-suggested-change'
import {ConversationCommentBox} from './ConversationCommentBox'
import {SuggestedChangeView} from './SuggestedChangeView'

type CommentState = 'editing' | 'hidden' | 'visible'

export interface ReviewThreadCommentProps {
  anchorPrefix?: string
  comment: Comment
  commentConnectionId?: string
  commentingImplementation: CommentingImplementation
  filePath: string
  hideActions?: boolean
  index?: number
  /**
   * If true, the comment will scroll itself into view and show a blue border
   * when the component renders with a hash that matches the comment.
   */
  isAnchorable?: boolean
  isLastChild?: boolean
  isOutdated?: boolean
  isThreadResolved: boolean
  onRefreshThread?: (threadId: string) => void
  onQuoteReply?: (quotedText?: string) => void
  repositoryId: string
  subject?: Subject
  subjectId: string
  suggestedChangesConfig?: SuggestedChangesConfiguration
  applySuggestedChangesValidationData?: ApplySuggestedChangesValidationData
  threadCommentCount?: number
  threadId: string
  threadsConnectionId?: string
  viewerData?: ViewerData
  ghostUser?: CommentAuthor
}

export function ReviewThreadComment({
  isAnchorable = false,
  index = 0,
  isLastChild,
  isOutdated,
  isThreadResolved,
  anchorPrefix = 'r',
  comment,
  commentingImplementation,
  filePath,
  hideActions,
  onRefreshThread,
  onQuoteReply = noop,
  subjectId,
  subject,
  threadCommentCount,
  threadId,
  threadsConnectionId,
  suggestedChangesConfig,
  applySuggestedChangesValidationData,
  viewerData,
  ghostUser = VALUES.ghostUser,
}: ReviewThreadCommentProps): JSX.Element {
  const {addToast} = useToastContext()
  const [isEditing, setIsEditing] = useState(false)
  const [isMinimized, setIsMinimized] = useState(comment.isHidden)
  const [bodyText, setBodyText] = useState(comment.body)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const {persistCommentToStorage, removePersistedCommentFromStorage} = usePersistedDiffCommentData({
    subjectId,
    filePath,
    fileLevelComment: comment.subjectType === 'FILE',
    threadId: comment.id,
    handlePersistedCommentExists: ({text}) => {
      if (!text) return
      setBodyText(text)
    },
  })
  const {editComment, deleteComment, hideComment, unhideComment, lazyFetchReactionGroups, lazyFetchEditHistory} =
    commentingImplementation
  const commentBoxRef = useRef<CommentBoxHandle>(null)
  const commentBodyRef = useRef<HTMLDivElement>(null)

  const focusCommentBox = () => {
    commentBoxRef.current?.focus()
  }

  useEffect(() => {
    if (isEditing) {
      setTimeout(focusCommentBox)
    }
  }, [isEditing])

  const onDelete = () => {
    deleteComment({
      commentId: comment.id,
      onCompleted: () => {
        onRefreshThread?.(threadId)
      },
      onError: () => {
        setIsSubmitting(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to delete comment',
        })
      },
      threadCommentCount,
      threadId,
      threadsConnectionId,
      filePath,
    })
  }

  const onHide = (reason: string) => {
    hideComment({
      commentId: comment.id,
      reason,
      onCompleted: () => {
        onRefreshThread?.(threadId)
      },
      onError: () => {
        setIsSubmitting(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to hide comment',
        })
      },
    })
  }

  const onUnhide = () => {
    unhideComment({
      commentId: comment.id,
      onCompleted: () => {
        onRefreshThread?.(threadId)
      },
      onError: () => {
        setIsSubmitting(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to unhide comment',
        })
      },
    })
  }

  const onEdit = () => {
    setIsEditing(true)
  }

  const onCancel = () => {
    setIsEditing(false)
    removePersistedCommentFromStorage()
    setBodyText(comment.body)
  }

  const onChange = (newBody: string) => {
    persistCommentToStorage({text: newBody})
    setBodyText(newBody)
    setErrorMessage(undefined)
  }

  const onSave = useCallback(() => {
    setIsSubmitting(true)

    const suggestedChangedEvaluation = validateSuggestedChange(
      bodyText,
      suggestedChangesConfig?.sourceContentFromDiffLines ?? '',
    )
    if (!suggestedChangedEvaluation.isValid) {
      setErrorMessage(suggestedChangedEvaluation.errorMessage)
      setIsSubmitting(false)

      return
    }

    editComment({
      text: bodyText,
      comment,
      onCompleted: () => {
        setIsEditing(false)
        setIsSubmitting(false)
        removePersistedCommentFromStorage()
        onRefreshThread?.(threadId)
      },
      onError: () => {
        setIsSubmitting(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to update comment',
        })
      },
    })
  }, [
    addToast,
    bodyText,
    comment,
    editComment,
    onRefreshThread,
    removePersistedCommentFromStorage,
    suggestedChangesConfig,
    threadId,
  ])

  // if the hash is `#r42`, this will be `r42`
  const commentId = comment.currentDiffResourcePath?.split('#r').pop()
  const commentAnchor = commentId ? `${anchorPrefix}${commentId}` : undefined
  const commentHref =
    commentAnchor && ssrSafeLocation
      ? new URL(`${ssrSafeLocation.pathname}#${commentAnchor}`, ssrSafeLocation.origin).toString()
      : undefined
  const containerRef = useRef<HTMLDivElement>(null)

  // This mirrors what we do in dotcom currently, see `progressive.ts`. By clicking
  // the link we're able to let the browser apply the `:target` pseudo class to the
  // container and scroll it into view.
  useEffect(() => {
    if (!isAnchorable) return

    if (commentId && commentAnchor && window.location.hash.split('#').pop() === commentAnchor) {
      anchorComment(commentId, anchorPrefix)
      containerRef.current?.focus()
    }
  }, [anchorPrefix, commentAnchor, commentId, isAnchorable])

  const blueFocusOutlineStyles = {
    outline: `2px solid`,
    outlineColor: 'accent.fg',
    outlineOffset: `-2px`,
    boxShadow: 'none',
  }

  const isReply = index > 0
  const isNestedReply = index > 1
  const areSuggestedChangesEnabled = commentingImplementation.suggestedChangesEnabled

  const commentState: CommentState = isEditing ? 'editing' : isMinimized ? 'hidden' : 'visible'

  return (
    <Box
      ref={containerRef}
      id={isAnchorable ? commentAnchor : undefined}
      tabIndex={-1}
      sx={{
        '&:not(:first-child)': {
          backgroundColor: 'canvas.inset',
        },
        '&:first-child + div': {
          borderTop: '1px solid',
          borderColor: 'border.muted',
        },
        ':target': blueFocusOutlineStyles,
        ':focus': blueFocusOutlineStyles,
        pb: isReply ? 0 : 2,
      }}
    >
      {isNestedReply && (
        <Box sx={{display: 'flex', pl: isReply ? 1 : 0}}>
          <Box
            sx={{
              ml: 4,
              height: 8,
              borderLeft: '1px solid',
              borderColor: 'border.default',
            }}
          />
        </Box>
      )}
      <Box sx={{px: 3, pt: isNestedReply ? 0 : 2, pb: 0}}>
        <CommentHeader
          headingProps={{as: 'h5'}}
          avatarUrl={comment.author?.avatarUrl ?? ghostUser.avatarUrl}
          comment={{
            ...comment,
            url: commentHref ?? '',
            referenceText: comment.reference.text ?? `#${comment.reference.number}`,
          }}
          commentRef={containerRef}
          deleteComment={onDelete}
          editComment={onEdit}
          hideComment={onHide}
          onMinimize={setIsMinimized}
          isMinimized={isMinimized}
          commentAuthorLogin={comment.author?.login ?? ghostUser.login}
          navigate={noop}
          commentSubjectAuthorLogin={comment.reference?.author?.login ?? ''}
          commentSubjectType={commentingImplementation.commentSubjectType}
          onReplySelect={onQuoteReply}
          unhideComment={onUnhide}
          hideActions={hideActions}
          lazyFetchEditHistory={lazyFetchEditHistory}
          isReply
        />
      </Box>
      <Box sx={{display: 'flex', pl: isReply ? 1 : 0}}>
        {isReply && (
          <Box
            sx={{
              ml: 4,
              mr: 1,
              pl: 3,
              borderLeft: '1px solid',
              borderColor: 'border.default',
              ...(isLastChild && {
                borderImage:
                  'linear-gradient(to bottom, var(--borderColor-default, var(--color-border-default)), rgba(0, 0, 0, 0)) 1 100%',
              }),
            }}
          />
        )}

        {commentState === 'editing' && (
          <Box sx={{pr: 2, pl: isReply ? 0 : 2, pb: 2, pt: 1, flexGrow: 1}}>
            <ConversationCommentBox
              ref={commentBoxRef}
              label="Update comment"
              value={bodyText}
              onChange={onChange}
              onPrimaryAction={onSave}
              userSettings={commentingImplementation.commentBoxConfig}
              suggestedChangesConfig={suggestedChangesConfig}
              markdownErrorMessage={errorMessage}
            >
              <CommentBoxButton variant="default" onClick={onCancel}>
                Cancel
              </CommentBoxButton>
              <CommentBoxButton disabled={isSubmitting || !bodyText.length} variant="primary" onClick={onSave}>
                Update
              </CommentBoxButton>
            </ConversationCommentBox>
          </Box>
        )}

        {commentState === 'visible' && (
          <Box sx={isReply ? {pb: 2, pr: 2, overflowX: 'auto', width: '100%'} : {px: 3, pb: 2, width: '100%'}}>
            {comment.bodyHTML && (
              <>
                <SafeHTMLBox
                  ref={commentBodyRef}
                  className="markdown-body"
                  comment-testid={`Comment body html for comment ${comment.id}`}
                  html={comment.bodyHTML as SafeHTMLString}
                  sx={{
                    mt: 1,
                    fontSize: 1,
                  }}
                />
                <Box sx={{display: 'flex', flexDirection: 'column', mt: 3}}>
                  {lazyFetchReactionGroups ? (
                    <Suspense fallback={<ReactionViewerLoading />}>
                      <ReactionViewerQueryComponent id={comment.id} />
                    </Suspense>
                  ) : (
                    <ReactionViewer reactionGroups={comment} subjectId={comment.id} />
                  )}
                </Box>
                {areSuggestedChangesEnabled && applySuggestedChangesValidationData && (
                  <SuggestedChangeView
                    comment={comment}
                    commentBodyRef={commentBodyRef}
                    commentingImplementation={commentingImplementation}
                    filePath={filePath}
                    isOutdated={isOutdated}
                    isThreadResolved={isThreadResolved}
                    threadId={threadId}
                    suggestedChangesConfig={suggestedChangesConfig}
                    applySuggestedChangesValidationData={applySuggestedChangesValidationData}
                    subject={subject}
                    viewerData={viewerData}
                  />
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
