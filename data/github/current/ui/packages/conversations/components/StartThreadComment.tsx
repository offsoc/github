import {GitHubAvatar} from '@github-ui/github-avatar'
import {XIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton} from '@primer/react'

import {anchorComment} from '../helpers'
import type {CommentingImplementation} from '../types'
import type {AddCommentEditorProps} from './AddCommentEditor'
import {AddCommentEditor} from './AddCommentEditor'

export interface StartThreadCommentProps
  extends Pick<
    AddCommentEditorProps,
    | 'batchPending'
    | 'batchingEnabled'
    | 'commentBoxConfig'
    | 'fileLevelComment'
    | 'filePath'
    | 'lineNumber'
    | 'repositoryId'
    | 'subjectId'
    | 'suggestedChangesConfig'
  > {
  addCommentDialogTitle?: string
  isLeftSide: boolean | undefined
  onAddComment: CommentingImplementation['addThread'] | CommentingImplementation['addFileLevelThread']
  onClose?: () => void
  viewerData: {
    avatarUrl: string
    login: string
  }
  threadsConnectionId?: string
}

/**
 * The StartThreadComment component is used to render the comment editor when starting a new inline thread.
 */
export function StartThreadComment({
  addCommentDialogTitle,
  isLeftSide,
  filePath,
  lineNumber,
  onAddComment,
  onClose,
  viewerData,
  threadsConnectionId,
  ...rest
}: StartThreadCommentProps) {
  const handleAddComment = ({
    commentText,
    onCompleted,
    onError,
    submitBatch,
  }: {
    commentText: string
    onCompleted?: (threadId: string, commentDatabaseId?: number) => void
    onError: (error: Error) => void
    submitBatch?: boolean
  }) => {
    const handleCompleted = (threadId: string, commentDatabaseId?: number) => {
      if (commentDatabaseId) anchorComment(commentDatabaseId.toString())
      onCompleted?.(threadId, commentDatabaseId)
    }

    onAddComment({
      text: commentText,
      onError,
      onCompleted: handleCompleted,
      submitBatch,
      filePath,
      threadsConnectionId,
    })
  }

  return (
    <Box sx={{px: 2, pb: 2, pt: 1}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Heading as="h4" sx={{fontSize: 1, ml: 2, py: 2}}>
          <GitHubAvatar alt={viewerData.login} size={24} src={viewerData.avatarUrl || ''} sx={{mr: 2}} />
          <span>{addCommentDialogTitle ?? 'Add a comment'}</span>
        </Heading>
        {onClose && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            icon={XIcon}
            onClick={onClose}
            aria-label="Cancel"
          />
        )}
      </Box>
      <AddCommentEditor
        focusOnMount
        condensed={false}
        fileLevelComment={false}
        filePath={filePath}
        lineNumber={lineNumber}
        onAddComment={handleAddComment}
        onCancelComment={onClose}
        side={isLeftSide ? 'LEFT' : 'RIGHT'}
        {...rest}
      />
    </Box>
  )
}
