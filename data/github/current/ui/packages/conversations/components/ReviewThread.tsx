import {CompactCommentButton} from '@github-ui/commenting/CompactCommentButton'
import {useAnalytics} from '@github-ui/use-analytics'
import {Box} from '@primer/react'
import {useState} from 'react'

import {anchorComment} from '../helpers'
import {generateSuggestedChangeLineRangeFromDiffThread} from '../suggested-changes'
import type {CommentAuthor, Thread} from '../types'
import type {AddCommentEditorProps} from './AddCommentEditor'
import {AddCommentEditor} from './AddCommentEditor'
import type {ReviewThreadCommentProps} from './ReviewThreadComment'
import {ReviewThreadComment} from './ReviewThreadComment'
import {StaticUnifiedDiffPreview} from './StaticUnifiedDiffPreview'

export interface ReviewThreadProps
  extends Pick<
      ReviewThreadCommentProps,
      'commentingImplementation' | 'repositoryId' | 'subjectId' | 'subject' | 'viewerData'
    >,
    Pick<AddCommentEditorProps, 'batchingEnabled' | 'batchPending' | 'suggestedChangesConfig'> {
  commentAnchorPrefix?: string
  commentsConnectionId?: string
  filePath: string
  hideDiffPreview?: boolean
  onRefreshThread?: (threadId: string) => void
  tabSize?: number
  thread: Thread
  threadsConnectionId?: string
  shouldLimitHeight?: boolean
  ghostUser?: CommentAuthor
}

/**
 * Renders a given review thread's comments along with a reply comment box.
 *
 * TODO:
 * - Support paginated loading of large review threads.
 * - Better support for deleted comment authors.
 */
export function ReviewThread({
  batchingEnabled,
  batchPending,
  commentAnchorPrefix,
  commentingImplementation,
  commentsConnectionId,
  filePath,
  hideDiffPreview,
  onRefreshThread,
  repositoryId,
  subject,
  subjectId,
  tabSize,
  thread,
  threadsConnectionId,
  shouldLimitHeight = true,
  suggestedChangesConfig,
  viewerData,
  ghostUser,
}: ReviewThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [quoteReplyText, setQuoteReplyText] = useState<string | undefined>(undefined)
  const {sendAnalyticsEvent} = useAnalytics()
  const {addThreadReply} = commentingImplementation

  const addReplyComment = ({
    commentText,
    onCompleted,
    onError,
    submitBatch,
  }: {
    commentText: string
    onCompleted?: (commentDatabaseId?: number) => void
    onError: (error: Error) => void
    submitBatch?: boolean
  }) => {
    const commentsConnectionIds = []
    if (thread.commentsData.__id) commentsConnectionIds.push(thread.commentsData.__id)
    if (commentsConnectionId) commentsConnectionIds.push(commentsConnectionId)

    const handleCompleted = (commentDatabaseId?: number) => {
      if (commentDatabaseId) anchorComment(commentDatabaseId.toString())
      onCompleted?.()
      onRefreshThread?.(thread.id)
    }

    addThreadReply({
      commentsConnectionIds,
      filePath,
      thread,
      text: commentText,
      submitBatch,
      onCompleted: handleCompleted,
      onError,
      threadsConnectionId,
    })
    sendAnalyticsEvent('comments.add', 'ADD_COMMENT_BUTTON')
  }

  const cancelComment = () => {
    setIsReplying(false)
    sendAnalyticsEvent('comments.cancel_thread_reply', 'CANCEL_REVIEW_THREAD_BUTTON')
  }

  const onQuoteReply = (text?: string) => {
    setQuoteReplyText(text)
    setIsReplying(true)
  }

  if (thread.commentsData.comments === null || thread.commentsData.comments.length < 1) return null

  const lineRange = generateSuggestedChangeLineRangeFromDiffThread(thread)
  const applySuggestedChangesValidationData =
    thread.subjectType === 'LINE'
      ? {
          lineRange,
        }
      : undefined

  return (
    <div data-testid="review-thread">
      <Box sx={shouldLimitHeight ? {maxHeight: '40vh', overflowY: 'auto'} : {}}>
        {/**
         * We always render StaticUnifiedDiffPreview for threads in Activity View above the ReviewThread component.
         * This additional check will prevent 2 of them being rendered on outdated review threads
         * TODO: maybe we can move the rendering of this to be in the ReviewDialog component to avoid conditional logic in a future PR?
         * */}
        {!hideDiffPreview && thread.isOutdated && <StaticUnifiedDiffPreview tabSize={tabSize ?? 4} thread={thread} />}
        {thread.commentsData.comments.map((comment, index) => {
          return (
            <ReviewThreadComment
              isAnchorable
              index={index}
              isLastChild={index === thread.commentsData.comments.length - 1}
              key={comment.id}
              anchorPrefix={commentAnchorPrefix}
              comment={comment}
              commentConnectionId={thread.commentsData.__id}
              commentingImplementation={commentingImplementation}
              filePath={filePath}
              isOutdated={thread.isOutdated}
              repositoryId={repositoryId}
              subject={subject}
              subjectId={subjectId}
              threadId={thread.id}
              onRefreshThread={onRefreshThread}
              onQuoteReply={onQuoteReply}
              threadCommentCount={thread.commentsData.comments.length}
              threadsConnectionId={threadsConnectionId}
              isThreadResolved={!!thread.isResolved}
              suggestedChangesConfig={suggestedChangesConfig}
              applySuggestedChangesValidationData={applySuggestedChangesValidationData}
              viewerData={viewerData}
              ghostUser={ghostUser}
            />
          )
        })}
        {thread.viewerCanReply && (
          <Box
            sx={{
              backgroundColor: 'canvas.inset',
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
              p: 2,
            }}
          >
            {isReplying && (
              <AddCommentEditor
                batchingEnabled={batchingEnabled}
                batchPending={batchPending}
                commentBoxConfig={commentingImplementation.commentBoxConfig}
                condensed={false}
                fileLevelComment={true}
                filePath={filePath}
                focusOnMount={true}
                isReplying={true}
                onCancelComment={cancelComment}
                repositoryId={repositoryId}
                quotedText={quoteReplyText}
                subjectId={subjectId}
                threadId={thread.id}
                onAddComment={addReplyComment}
                suggestedChangesConfig={suggestedChangesConfig}
              />
            )}
            {!isReplying && (
              <CompactCommentButton
                onClick={() => {
                  sendAnalyticsEvent('comments.start_thread_reply', 'REPLY_TO_THREAD_INPUT_BUTTON')
                  setIsReplying(true)
                }}
              >
                Write a reply
              </CompactCommentButton>
            )}
          </Box>
        )}
      </Box>
    </div>
  )
}
